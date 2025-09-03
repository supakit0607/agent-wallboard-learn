# agent-wallboard-learn

# Final Testing Workflow:
Login Agent: POST /api/agents/A004/login
<img width="1278" height="800" alt="login" src="https://github.com/user-attachments/assets/4463526c-4952-4c56-adfd-6523116daf4d" />
Check Status: GET /api/agents (เห็น A004 status = Available)
<img width="1497" height="965" alt="available" src="https://github.com/user-attachments/assets/9772e789-3fb6-477f-9941-adfd17268572" />
Change Status: PATCH /api/agents/A004/status (เป็น Active)
<img width="1106" height="583" alt="active" src="https://github.com/user-attachments/assets/b51d16a8-f35b-4ebd-8922-b7c4c654215c" />
Check Dashboard: GET /api/dashboard/stats (เลขเปลี่ยน)
<img width="1333" height="770" alt="dashboard" src="https://github.com/user-attachments/assets/01ab9161-a057-4109-b4cd-3f312f539167" />
Logout: POST /api/agents/A004/logout (status เป็น Offline)
<img width="1486" height="646" alt="logout" src="https://github.com/user-attachments/assets/d7e52b1d-00a1-4892-a96c-f1a2a56da0e7" />
