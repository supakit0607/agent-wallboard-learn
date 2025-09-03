const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors());
const PORT = 3001;

// เพิ่มบรรทัดนี้ก่อน routes
app.use(express.json()); // สำคัญมาก!

/*AVAILABLE  = พร้อมรับสาย
ACTIVE     = กำลังคุยกับลูกค้า  
WRAP_UP    = บันทึกหลังจบสาย
NOT_READY  = ไม่พร้อมรับสาย (พัก/ประชุม)
OFFLINE    = ออฟไลน์*/

let agents = [{
    code: "A001",
    name: "Sup",
    status: "Available",
    lastStatusChange: new Date().toISOString(),
    loginTime: null
},
{
    code: "A004",
    name: "Supi",
    status: "Available",
    lastStatusChange: new Date().toISOString(),
    loginTime: null
},
{
    code: "A005",
    name: "Supa",
    status: "Available",
    lastStatusChange: new Date().toISOString(),
    loginTime: null
}];

app.get('/', (req, res) => {
    res.send(`Hello Agent Wallboard!`);
});

app.get('/hello', (req, res) => {
    res.send(`Supakit rakboot!`);
});

app.get('/health', (req, res) => {
   res.json({
    "status": "OK",
    "timestamp": new Date().toISOString()
    });
});

app.get('/api/agents', (req, res) => {
    res.json({
        success: true,
        data: agents,
        count: agents.length,
        timestamp: new Date().toISOString()
    });
});

app.get('/api/agents/count', (req, res) => {
    res.json({
        success: true,
        count: agents.length,
        timestamp: new Date().toISOString()
    });
});

// Agent Login API
app.post('/api/agents/:code/login', (req, res) => {
    const agentCode = req.params.code;
    const { name } = req.body;
    
    // 1. หา agent หรือสร้างใหม่
    let agent = agents.find(a => a.code === agentCode);
    
    if (!agent) {
        // สร้าง agent ใหม่ถ้าไม่พบ
        agent = {
            code: agentCode,
            name: name || `Agent ${agentCode}`,
            status: "Available",
            lastStatusChange: new Date().toISOString(),
            loginTime: new Date().toISOString()
        };
        agents.push(agent);
    } else {
        // อัพเดท agent ที่มีอยู่
        agent.status = "Available";
        agent.lastStatusChange = new Date().toISOString();
        agent.loginTime = new Date().toISOString();
        if (name) agent.name = name; // อัพเดทชื่อถ้ามีการส่งมา
    }

    console.log(`[${new Date().toISOString()}] Agent ${agentCode} logged in`);

    // 4. ส่ง response
    res.json({
        success: true,
        message: `Agent ${agentCode} logged in successfully`,
        data: agent
    });
});

// Agent Logout API - ตาม requirements
app.post('/api/agents/:code/logout', (req, res) => {
    const agentCode = req.params.code;

    // หา agent ในระบบ
    const agent = agents.find(a => a.code === agentCode);
    
    if (!agent) {
        return res.status(404).json({
            success: false,
            error: "Agent not found"
        });
    }

    // บันทึกสถานะเดิมไว้ (เพื่อ log)
    const oldStatus = agent.status;

    // เปลี่ยน status เป็น Offline และลบ loginTime
    agent.status = "Offline";
    agent.lastStatusChange = new Date().toISOString();
    const loginTime = agent.loginTime;
    agent.loginTime = null;

    console.log(`[${new Date().toISOString()}] Agent ${agentCode} logged out`);

    // ส่ง response กลับ
    res.json({
        success: true,
        message: `Agent ${agentCode} logged out successfully`,
        data: {
            ...agent,
            previousStatus: oldStatus,
            loginDuration: loginTime ? Math.round((new Date() - new Date(loginTime)) / 1000) + " seconds" : "N/A"
        }
    });
});

//URL: http://localhost:3001/api/agents/A001/status
app.patch('/api/agents/:code/status', (req, res) => {
    // Step 1: ดึง agent code จาก URL
    const agentCode = req.params.code;

    // Step 2: ดึง status ใหม่จาก body
    const newStatus = req.body.status;
    
    console.log('Agent Code:', agentCode);
    console.log('New Status:', newStatus);

    // Step 3: หา agent ในระบบ
    const agent = agents.find(a => a.code === agentCode);
    
    console.log('found agent:', agent);

    // Step 4: ตรวจสอบว่าเจอ agent ไหม?
    if (!agent) {
        return res.status(404).json({
            success: false,
            error: "Agent not found"
        });
    }

    // Step 5: ตรวจสอบว่า status ที่ส่งมาถูกต้องไหม?
    const validStatuses = ["Available", "Active", "Wrap Up", "Not Ready", "Offline"];
    if (!validStatuses.includes(newStatus)) {
        return res.status(400).json({
            success: false,
            error: "Invalid status",
            validStatuses: validStatuses
        });
    }  
    
    // Step 6: บันทึกสถานะเดิมไว้ (เพื่อ log)
    const oldStatus = agent.status;

    // Step 7: เปลี่ยน status
    agent.status = newStatus;
    agent.lastStatusChange = new Date().toISOString();
    
    console.log('current agent :', agent);

    console.log(`[${new Date().toISOString()}] Agent ${agentCode}: ${oldStatus} → ${newStatus}`);

    // Step 8: ส่ง response กลับ
    res.json({
        success: true,
        message: `Agent ${agentCode} status changed from ${oldStatus} to ${newStatus}`,
        data: agent
    });
});

// เพิ่ม route ใหม่สำหรับ dashboard stats (อยู่นอก route อื่น)
app.get('/api/dashboard/stats', (req, res) => {
    // ขั้นที่ 1: นับจำนวนรวม
    const totalAgents = agents.length;

    // ขั้นที่ 2: นับจำนวนแต่ละ status
    const available = agents.filter(a => a.status === "Available").length;
    const active = agents.filter(a => a.status === "Active").length;
    const wrapUp = agents.filter(a => a.status === "Wrap Up").length;
    const notReady = agents.filter(a => a.status === "Not Ready").length;
    const offline = agents.filter(a => a.status === "Offline").length;

    // ขั้นที่ 3: คำนวณเปอร์เซ็นต์
    const availablePercent = totalAgents > 0 ? Math.round((available / totalAgents) * 100) : 0;
    const activePercent = totalAgents > 0 ? Math.round((active / totalAgents) * 100) : 0;
    const wrapUpPercent = totalAgents > 0 ? Math.round((wrapUp / totalAgents) * 100) : 0;
    const notReadyPercent = totalAgents > 0 ? Math.round((notReady / totalAgents) * 100) : 0;
    const offlinePercent = totalAgents > 0 ? Math.round((offline / totalAgents) * 100) : 0;

    // ส่ง response กลับ
    res.json({
        success: true,
        data: {
            total: totalAgents,
            available: available,
            active: active,
            wrapUp: wrapUp,
            notReady: notReady,
            offline: offline,
            percentages: {
                available: availablePercent,
                active: activePercent,
                wrapUp: wrapUpPercent,
                notReady: notReadyPercent,
                offline: offlinePercent
            }
        },
        timestamp: new Date().toISOString()
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});