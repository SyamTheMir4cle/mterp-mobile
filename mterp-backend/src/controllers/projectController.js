const Project = require('../models/Project');
const DailyReport = require('../models/DailyReport');

// 1. Create Project
// 1. Create Project
exports.createProject = async (req, res) => {
    if (!['owner', 'director', 'admin'].includes(req.user.role)) {
        return res.status(403).json({ msg: 'Akses Ditolak' });
    }

    try {
        // --- DATA PARSING ---
        // Frontend sends: formData.append('data', JSON.stringify(projectData))
        // Files are sent with keys: shopDrawing, hse, etc.
        
        let projectData = {};
        if (req.body.data) {
            try {
                projectData = JSON.parse(req.body.data);
            } catch (e) {
                return res.status(400).json({ msg: 'Invalid JSON Data' });
            }
        } else {
             // Fallback for Postman/legacy tests (raw fields)
             projectData = req.body;
        }

        const { name, lokasi, totalBudget, globalDates, supplies, workItems, description } = projectData;

        // --- FILE MAPPING ---
        const docs = { ...projectData.documents }; // Keep existing structure if passed
        
        if (req.files) {
            // Map uploaded files to schema keys
            const mapFile = (key) => {
                if (req.files[key]?.[0]) return `/uploads/${req.files[key][0].filename}`;
                return null;
            };

            if (req.files['shopDrawing']) docs.shopDrawing = mapFile('shopDrawing');
            if (req.files['hse']) docs.hse = mapFile('hse');
            if (req.files['manPowerList']) docs.manPowerList = mapFile('manPowerList');
            if (req.files['workItemsList']) docs.workItemsList = mapFile('workItemsList');
            if (req.files['materialList']) docs.materialList = mapFile('materialList');
            if (req.files['toolsList']) docs.toolsList = mapFile('toolsList');
            
            // Legacy Support
            if (req.files['perencanaan']) docs.perencanaan = mapFile('perencanaan');
        }

        // --- CREATE PROJECT ---
        const project = await Project.create({
            nama: name, // Frontend sends 'name', DB uses 'nama'
            lokasi: projectData.location || lokasi, // Frontend sends 'location', DB uses 'lokasi'
            description,
            totalBudget: Number(totalBudget) || 0,
            
            globalDates: globalDates || { 
                planned: { start: new Date(), end: new Date() }, 
                actual: { start: null, end: null } 
            },
            
            startDate: globalDates?.planned?.start ? new Date(globalDates.planned.start) : new Date(),
            endDate: globalDates?.planned?.end ? new Date(globalDates.planned.end) : new Date(),
            
            supplies: supplies || [],
            workItems: workItems || [],
            documents: docs,
            
            status: 'Planning',
            createdBy: req.user.id
        });

        res.json(project);
    } catch (e) {
        console.error("Create Project Error:", e);
        res.status(500).json({ error: e.message });
    }
};

// 2. Get All Projects
exports.getProjects = async (req, res) => {
    try {
        const projects = await Project.find().sort({ createdAt: -1 });
        res.json(projects);
    } catch (e) { res.status(500).json({ error: e.message }); }
};

// 3. Get Single Project (Detail) -> FUNGSI INI YANG MUNGKIN HILANG SEBELUMNYA
exports.getProjectById = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ msg: 'Proyek tidak ditemukan' });
        res.json(project);
    } catch (e) { res.status(500).json({ error: e.message }); }
};

// 4. Update Progress
exports.updateProgress = async (req, res) => {
    try {
        const project = await Project.findByIdAndUpdate(
            req.params.id, 
            { progress: req.body.progress }, 
            { new: true }
        );
        res.json(project);
    } catch (e) { res.status(500).json({ error: e.message }); }
};

// 5. Delete Project
exports.deleteProject = async (req, res) => {
    if (!['owner', 'director', 'admin'].includes(req.user.role)) {
        return res.status(403).json({ msg: 'Hanya Owner/Direktur yang boleh menghapus.' });
    }
    try {
        const projectId = req.params.id;
        await DailyReport.deleteMany({ projectId });
        const project = await Project.findByIdAndDelete(projectId);
        if (!project) return res.status(404).json({ msg: 'Proyek tidak ditemukan' });
        res.json({ msg: 'Proyek berhasil dihapus.' });
    } catch (e) { res.status(500).json({ error: e.message }); }
};

// 6. Create Daily Update (with Auto Item Update)
exports.createDailyUpdate = async (req, res) => {
    try {
        const projectId = req.params.id;
        let updateData = {};
        if (req.body.data) {
            try { updateData = JSON.parse(req.body.data); } 
            catch (e) { return res.status(400).json({ msg: 'Format Data Salah' }); }
        }

        let fotoPath = null;
        if (req.file) fotoPath = `/uploads/${req.file.filename}`;

        const report = await DailyReport.create({
            projectId,
            date: updateData.date || new Date(),
            workProgress: updateData.workProgress,
            workforce: updateData.workforce,
            resources: updateData.resources,
            foto: fotoPath,
            reportedBy: req.user.id
        });

        // Update Project Items
        const project = await Project.findById(projectId);
        if (project) {
            if (req.body.progress) project.progress = req.body.progress;
            if (updateData.workProgress && Array.isArray(updateData.workProgress)) {
                updateData.workProgress.forEach(updateItem => {
                    const targetItem = project.workItems.find(i => i.id == updateItem.id);
                    if (targetItem) targetItem.progress = updateItem.currentProgress;
                });
            }
            project.markModified('workItems');
            await project.save();
        }
        res.json({ msg: 'Laporan tersimpan', data: report });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
};

// 7. Get S-Curve Data
exports.getSCurveData = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ msg: 'Project not found' });

        const reports = await DailyReport.find({ projectId: project._id }).sort({ date: 1 });
        const start = project.startDate ? new Date(project.startDate) : new Date(project.createdAt);
        const end = project.endDate ? new Date(project.endDate) : new Date(start.getTime() + (30 * 24 * 60 * 60 * 1000));
        
        let totalDuration = (end - start) / (1000 * 60 * 60 * 24);
        if (totalDuration <= 0) totalDuration = 1;

        let labels = ['Start'];
        let plannedData = [0];
        let actualData = [0];

        reports.forEach(rep => {
            const repDate = new Date(rep.date);
            labels.push(`${repDate.getDate()}/${repDate.getMonth() + 1}`);

            let dailyAvg = 0;
            if (rep.workProgress?.length > 0) {
                const total = rep.workProgress.reduce((acc, i) => acc + (Number(i.currentProgress) || 0), 0);
                dailyAvg = total / rep.workProgress.length;
            }
            actualData.push(Math.round(dailyAvg));

            const daysPassed = (repDate - start) / (1000 * 60 * 60 * 24);
            let planned = (daysPassed / totalDuration) * 100;
            planned = Math.min(Math.max(planned, 0), 100);
            plannedData.push(Math.round(planned));
        });

        if (labels.length === 1) { // Jika belum ada data
            labels.push('End');
            plannedData.push(100);
            actualData.push(0);
        }

        res.json({ labels, plannedData, actualData });
    } catch (e) { res.status(500).json({ error: e.message }); }
};
