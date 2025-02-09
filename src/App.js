import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import styled from 'styled-components';

// 定义全局样式
const GlobalStyle = styled.div`
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #0d1117;
  color: #c9d1d9;
  min-height: 100vh;
  padding: 20px;
`;

// 卡片样式
const Card = styled.div`
  background-color: #161b22;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
`;

// 输入框样式
const Input = styled.input`
  padding: 10px;
  margin-right: 10px;
  border: none;
  border-radius: 4px;
  background-color: #0d1117;
  color: #c9d1d9;
  outline: none;
  width: 100%;
  box-sizing: border-box;
`;

// 按钮样式
const Button = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  background-color: #238636;
  color: white;
  cursor: pointer;
  &:hover {
    background-color: #2ea043;
  }
`;

// 表格样式
const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
`;

const TableHeader = styled.th`
  padding: 10px;
  border: 1px solid #30363d;
  text-align: left;
`;

const TableCell = styled.td`
  padding: 10px;
  border: 1px solid #30363d;
  width: auto;
  min-width: 100px;
`;

// 下拉列表样式
const Select = styled.select`
  padding: 10px;
  margin-right: 10px;
  border: none;
  border-radius: 4px;
  background-color: #0d1117;
  color: #c9d1d9;
  outline: none;
  width: 100%;
  box-sizing: border-box;
`;

// Tab 导航样式
const TabNav = styled.div`
  display: flex;
  margin-bottom: 20px;
`;

const TabButton = styled.button`
  padding: 10px 20px;
  border: none;
  background-color: ${(props) => (props.active ? '#238636' : '#161b22')};
  color: white;
  cursor: pointer;
  margin-right: 10px;
  border-radius: 4px;

  &:hover {
    background-color: #2ea043;
  }
`;

// 登录页面组件
const LoginPage = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      //console.log('发送登录请求，用户名：', username, '，密码：', password);
      const response = await axios.post('http://localhost:8081/login', {
        username,
        password,
      });
      console.log('登录响应：', response.data);
      const result = response.data.trim(); // 去除首尾空格
      if (result === '登录成功') {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('username', username);
        onLogin(username);
      } else {
        alert('登录失败，请检查用户名和密码');
      }
    } catch (error) {
      console.error('登录出错:', error);
      console.error('错误响应：', error.response);
      alert('登录出错，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GlobalStyle style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Card>
        <h2>登录</h2>
        <Input
          type="text"
          placeholder="用户名"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <Input
          type="password"
          placeholder="密码"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button onClick={handleLogin} disabled={isLoading}>
          {isLoading ? '登录中...' : '登录'}
        </Button>
      </Card>
    </GlobalStyle>
  );
};

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('isLoggedIn') === 'true');
  const [username, setUsername] = useState(localStorage.getItem('username'));
  const [users, setUsers] = useState([]);
  const [inventories, setInventories] = useState([]);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [editingInventory, setEditingInventory] = useState(null);
  const [confirmedInventories, setConfirmedInventories] = useState([]);
  const [activeTab, setActiveTab] = useState(1);

  // 获取所有用户
  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:8081/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  // 获取所有库存信息
  const fetchInventories = useCallback(async () => {
    try {
      let response;
      if (username === '45420191') {
        response = await axios.get('http://localhost:8081/inventories');
      } else {
        response = await axios.get(`http://localhost:8081/inventories?ownerId=${username}`);
      }
      setInventories(response.data);
    } catch (error) {
      console.error('Error fetching inventories:', error);
    }
  }, [username]);

  // 创建新用户
  const createUser = async () => {
    try {
      const response = await axios.post('http://localhost:8081/users', {
        username: newUsername,
        password: newPassword,
      });
      setUsers([...users, response.data]);
      setNewUsername('');
      setNewPassword('');
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  // 开始编辑库存项
  const startEditing = (inventory) => {
    setEditingInventory({ ...inventory });
  };

  // 保存修改后的库存项
  const saveInventory = async (inventoryId) => {
    if (editingInventory) {
      const updatedInventories = inventories.map((inv) => {
        if (inv.id === inventoryId) {
          return editingInventory;
        }
        return inv;
      });
      setInventories(updatedInventories);
      try {
        console.log('Sending PUT request to:', `http://localhost:8081/inventories/${inventoryId}`);
        console.log('Request data:', editingInventory);
        const response = await axios.put(`http://localhost:8081/inventories/${inventoryId}`, editingInventory);
        console.log('PUT request response:', response);
      } catch (error) {
        console.error('Error saving inventory:', error);
      }
      setEditingInventory(null);
    }
  };


  // 确认库存项，使其不可编辑
  const confirmInventory = async (inventoryId) => {
    if (!confirmedInventories.includes(inventoryId)) {
      try {
        // 调用后端接口确认库存信息
        const response = await axios.put(`http://localhost:8081/inventories/${inventoryId}/confirm`);
        console.log('Confirm inventory response:', response);
        setConfirmedInventories([...confirmedInventories, inventoryId]);
        setEditingInventory(null);
      } catch (error) {
        console.error('Error confirming inventory:', error);
      }
    }
  };

  // 退出登录
  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    setIsLoggedIn(false);
    setUsername('');
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchUsers();
      fetchInventories();
    }
  }, [isLoggedIn, fetchInventories]);

  const handleLoginSuccess = (username) => {
    setIsLoggedIn(true);
    setUsername(username); // 设置用户名状态
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLoginSuccess} />;
  }

  // 下载Excel文件
  const downloadExcel = () => {
    window.open('http://localhost:8081/inventories/export/excel', '_blank');
  };

  return (
    <GlobalStyle>
      <h1 style={{ textAlign: 'center' }}>Inventory Check System</h1>
      <p style={{ textAlign: 'right' }}>Welcome {username}</p> {/* 显示用户名 */}
      <Button onClick={handleLogout} style={{ float: 'right' }}>退出</Button> {/* 添加退出按钮 */}

      <TabNav>
        <TabButton active={activeTab === 0} onClick={() => setActiveTab(0)} disabled={username !== '45420191'}>
          用户信息
        </TabButton>
        <TabButton active={activeTab === 1} onClick={() => setActiveTab(1)}>
          库存管理
        </TabButton>
      </TabNav>
      {activeTab === 0 && (
        <div>
          {/* <Card>
            <h2>创建新用户</h2>
            <Input
              type="text"
              placeholder="用户名"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
            />
            <Input
              type="password"
              placeholder="密码"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <Button onClick={createUser}>创建</Button>
          </Card> */}
          <Card>
            <h2>数据下载</h2>
            <Button onClick={downloadExcel} style={{ marginBottom: '20px' }}>下载库存Excel</Button>
          </Card>
          <Card>
            <h2>用户列表</h2>
            <Table>
              <thead>
                <tr>
                  <TableHeader>ID</TableHeader>
                  <TableHeader>用户名</TableHeader>
                  <TableHeader>密码</TableHeader>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <TableCell>{user.id}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>***</TableCell>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        </div>
      )}
      {activeTab === 1 && (
        <Card>
          <h2>库存列表</h2>
          <Table>
            <thead>
              <tr>
                <TableHeader>ID</TableHeader>
                <TableHeader>Level3 - GBGF</TableHeader>
                <TableHeader>Manager Name</TableHeader>
                <TableHeader>Legal Entity</TableHeader>
                <TableHeader>Owner ID</TableHeader>
                <TableHeader>Name</TableHeader>
                <TableHeader>Empl Class</TableHeader>
                <TableHeader>Brand</TableHeader>
                <TableHeader>Model</TableHeader>
                <TableHeader>IMEI/MEID</TableHeader>
                <TableHeader>Device Type</TableHeader>
                <TableHeader>Asset ID</TableHeader>
                <TableHeader>Inventory Check</TableHeader>
                <TableHeader>Remark</TableHeader>
                <TableHeader>编辑</TableHeader>
                <TableHeader>确认</TableHeader>
              </tr>
            </thead>
            <tbody>
              {inventories.map((inventory) => (
                <tr key={inventory.id}>
                  <TableCell>{inventory.id}</TableCell>
                  <TableCell>
                    {inventory.gbgf}
                  </TableCell>
                  <TableCell>
                    {inventory.managerName}
                  </TableCell>
                  <TableCell>
                    {inventory.legalEntity}
                  </TableCell>
                  <TableCell>
                    {inventory.ownerId}
                  </TableCell>
                  <TableCell>
                    {inventory.name}
                  </TableCell>
                  <TableCell>
                    {inventory.emplClass}
                  </TableCell>
                  <TableCell>
                    {inventory.brand}
                  </TableCell>
                  <TableCell>
                    {inventory.model}
                  </TableCell>
                  <TableCell>
                    {inventory.imeiMeid}
                  </TableCell>
                  <TableCell>
                    {inventory.deviceType}
                  </TableCell>
                  <TableCell>
                    {inventory.assetId}
                  </TableCell>
                  <TableCell>
                    {editingInventory && editingInventory.id === inventory.id ? (
                      <Select
                        name="inventoryCheck"
                        value={editingInventory.inventoryCheck}
                        onChange={(e) => setEditingInventory({ ...editingInventory, inventoryCheck: e.target.value })}
                        onBlur={() => saveInventory(inventory.id)}
                      >
                        <option value="Confirmed">Confirmed</option>
                        <option value="Broken">Broken</option>
                        <option value="Lost">Lost</option>
                        <option value="Others">Others</option>
                      </Select>
                    ) : (
                      inventory.inventoryCheck
                    )}
                  </TableCell>
                  <TableCell>
                    {editingInventory && editingInventory.id === inventory.id ? (
                      <Input
                        type="text"
                        name="remark"
                        value={editingInventory.remark}
                        onChange={(e) => setEditingInventory({ ...editingInventory, remark: e.target.value })}
                        onBlur={() => saveInventory(inventory.id)}
                      />
                    ) : (
                      inventory.remark
                    )}
                  </TableCell>
                  <TableCell>
                    <Button onClick={() => startEditing(inventory)}
                      disabled={confirmedInventories.includes(inventory.id) || inventory.confirm === 'true'}
                    >
                      {confirmedInventories.includes(inventory.id) || inventory.confirm === 'true' ? '不可编辑' : '编辑'}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Button
                      onClick={() => confirmInventory(inventory.id)}
                      disabled={confirmedInventories.includes(inventory.id) || inventory.confirm === 'true'}
                    >
                      {confirmedInventories.includes(inventory.id) || inventory.confirm === 'true' ? '已确认' : '确认'}
                    </Button>
                  </TableCell>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      )}
    </GlobalStyle>
  );
};

export default App;