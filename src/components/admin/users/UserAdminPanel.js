import React, { useState } from 'react';
import { Tabs, Tab, Alert, Container } from 'react-bootstrap';
import UsersManagement from './UsersManagement';
import './admin.css';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [error, setError] = useState(null);

  return (
    <div className="admin-app">
      <div className="admin-content">
        <Container>
          <div className="admin-header">
            <h1>Административная панель</h1>
            <p className="admin-subtitle">Управление системой и пользователями</p>
          </div>

          {error && (
            <Alert 
              variant="danger" 
              onClose={() => setError(null)} 
              dismissible
              className="admin-alert"
            >
              {error}
            </Alert>
          )}

          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
            className="admin-tabs"
          >
            <Tab eventKey="users" title="Пользователи">
              <UsersManagement setError={setError} />
            </Tab>
          </Tabs>
        </Container>
      </div>
    </div>
  );
};

export default AdminPanel;