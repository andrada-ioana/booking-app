import React, { useEffect, useState } from 'react';
import './styles.css'; // create styles for layout
import Header from '../../components/Header';

const AdminPage = () => {
  const [monitoredUsers, setMonitoredUsers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMonitoredUsers = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/monitored-users`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!res.ok) throw new Error('Failed to fetch monitored users');
        const data = await res.json();
        setMonitoredUsers(data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchMonitoredUsers();
  }, []);

  return (
    <div>
      <Header />
      <div className="admin-page">
        <h2>Monitored Users</h2>
        {error && <p className="error">{error}</p>}
        <table className="admin-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {monitoredUsers.map(({ id, User }) => (
              <tr key={id}>
                <td>{User.username}</td>
                <td>{User.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPage;
