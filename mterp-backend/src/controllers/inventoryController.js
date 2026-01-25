const Inventory = require('../models/Inventory');
const ProjectTool = require('../models/ProjectTool');
const ToolUsage = require('../models/ToolUsage');

// --- HELPER: Cek Role Asset Admin ---
const isAssetAdmin = (req) => {
    return ['asset_admin', 'owner', 'director'].includes(req.user.role);
};

// 1. DASHBOARD GLOBAL (Bisa dilihat semua user - Req 6)
exports.getToolDashboard = async (req, res) => {
    const { search } = req.query;
    try {
        let query = {};
        if (search) {
            query = { nama: { $regex: search, $options: 'i' } };
        }

        // Ambil data Master Inventory (Gudang)
        const warehouseTools = await Inventory.find(query);

        // Ambil data Alat yang tersebar di Proyek
        // Kita populate agar tahu nama project dan nama alatnya
        const deployedTools = await ProjectTool.find({ status: 'Active' })
            .populate('projectId', 'nama lokasi')
            .populate('toolId', 'nama kategori');

        // Filter deployed tools jika ada search parameter
        const filteredDeployed = search 
            ? deployedTools.filter(item => item.toolId.nama.match(new RegExp(search, 'i')))
            : deployedTools;

        res.json({
            warehouse: warehouseTools,
            deployed: filteredDeployed
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

// 2. ASSIGN TOOL KE PROJECT (Hanya Asset Admin - Req 1 & 5)
exports.assignToolToProject = async (req, res) => {
    if (!isAssetAdmin(req)) return res.status(403).json({ msg: 'Akses Ditolak. Khusus Asset Admin.' });

    const { toolId, projectId, quantity, notes } = req.body;

    try {
        // Cek stok gudang
        const tool = await Inventory.findById(toolId);
        if (!tool) return res.status(404).json({ msg: 'Alat tidak ditemukan' });
        if (tool.stok < quantity) return res.status(400).json({ msg: 'Stok di Gudang tidak cukup' });

        // Kurangi stok gudang
        tool.stok -= parseInt(quantity);
        await tool.save();

        // Tambahkan ke ProjectTool
        // Cek apakah alat ini sudah ada di project tersebut? Jika ya, tambah qty saja.
        let projectTool = await ProjectTool.findOne({ projectId, toolId, status: 'Active' });

        if (projectTool) {
            projectTool.quantity += parseInt(quantity);
            if (notes) projectTool.notes = notes; // Update notes jika ada
            projectTool.assignedBy = req.user.id;
            projectTool.assignedDate = Date.now();
            await projectTool.save();
        } else {
            projectTool = await ProjectTool.create({
                projectId,
                toolId,
                quantity,
                notes,
                assignedBy: req.user.id
            });
        }

        res.json({ msg: 'Alat berhasil ditransfer ke Proyek', data: projectTool });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

// 3. TAG TOOL USAGE (Hanya Asset Admin - Req 2 & 5)
exports.tagToolUsage = async (req, res) => {
    if (!isAssetAdmin(req)) return res.status(403).json({ msg: 'Akses Ditolak. Khusus Asset Admin.' });

    const { projectToolId, usedByWorker, workItem, notes } = req.body;

    try {
        const pTool = await ProjectTool.findById(projectToolId);
        if (!pTool) return res.status(404).json({ msg: 'Alat di proyek tidak ditemukan' });

        const usage = await ToolUsage.create({
            projectToolId,
            projectId: pTool.projectId,
            usedByWorker,
            workItem,
            notes,
            taggedBy: req.user.id
        });

        res.json({ msg: 'Penggunaan alat berhasil ditag', data: usage });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

// 4. GET PROJECT TOOLS & HISTORY (Untuk Laporan Proyek - Req 3)
exports.getProjectTools = async (req, res) => {
    const { projectId } = req.params;
    try {
        // Daftar alat yang standby di proyek ini
        const inventory = await ProjectTool.find({ projectId, status: 'Active' })
            .populate('toolId', 'nama satuan');

        // Log penggunaan harian di proyek ini (misal 7 hari terakhir)
        const usageLogs = await ToolUsage.find({ projectId })
            .populate({
                path: 'projectToolId',
                populate: { path: 'toolId', select: 'nama' }
            })
            .sort({ date: -1 })
            .limit(50);

        res.json({
            currentInventory: inventory,
            usageHistory: usageLogs
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

// 5. KEMBALIKAN ALAT DARI PROJECT KE GUDANG (Opsional - untuk manajemen lengkap)
exports.returnToolToWarehouse = async (req, res) => {
    if (!isAssetAdmin(req)) return res.status(403).json({ msg: 'Akses Ditolak.' });
    const { projectToolId, quantity } = req.body;

    try {
        const pTool = await ProjectTool.findById(projectToolId);
        if (!pTool) return res.status(404).json({ msg: 'Data tidak ditemukan' });
        if (pTool.quantity < quantity) return res.status(400).json({ msg: 'Jumlah pengembalian melebihi stok di proyek' });

        // Update Project Tool
        pTool.quantity -= parseInt(quantity);
        if (pTool.quantity === 0) pTool.status = 'Returned';
        await pTool.save();

        // Kembalikan ke Master Inventory
        const masterTool = await Inventory.findById(pTool.toolId);
        masterTool.stok += parseInt(quantity);
        await masterTool.save();

        res.json({ msg: 'Alat dikembalikan ke Gudang Utama' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

// === [RESTORED] FUNGSI LAMA UNTUK LIST/DROPDOWN ===
exports.getInventory = async (req, res) => {
    const { kategori } = req.query;
    // Filter kategori jika ada (misal: ?kategori=alat)
    const filter = kategori ? { kategori } : {}; 
    
    try {
        // Ambil stok yang ada di GUDANG UTAMA saja
        const items = await Inventory.find(filter);
        res.json(items);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

// [BARU] Get Chart Data
exports.getInventoryStats = async (req, res) => {
    try {
        const totalItems = await Inventory.countDocuments();
        const goodCondition = await Inventory.countDocuments({ kondisi: 'Bagus' });
        const badCondition = await Inventory.countDocuments({ kondisi: { $ne: 'Bagus' } }); // Rusak/Perlu Service
        
        // Cek alat yang sedang dipinjam (stok < total stok awal, logic ini butuh penyesuaian data real)
        // Untuk simpelnya kita pakai data projectTool
        const inUse = await ProjectTool.countDocuments({ status: 'Active' });

        res.json({
            good: goodCondition,
            damaged: badCondition,
            inUse: inUse
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};
