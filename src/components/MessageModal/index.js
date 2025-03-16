import React from 'react';
import Modal from 'react-modal';
import './styles.css';

const MessageModal = ({ isOpen, onRequestClose, message }) => {
    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            contentLabel="Message"
            className="message-modal"
            overlayClassName="message-modal-overlay"
        >
            <div className="message-modal-content">
                <h2>Notification</h2>
                <p>{message}</p>
                <button onClick={onRequestClose}>Close</button>
            </div>
        </Modal>
    );
};

export default MessageModal;