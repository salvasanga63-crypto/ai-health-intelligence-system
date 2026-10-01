import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { authFetch, getProfile } from '../lib/api';

export default function Chat() {
  const [user, setUser] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [newRoomTitle, setNewRoomTitle] = useState('');
  const [newRoomParticipants, setNewRoomParticipants] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    getProfile().then((profile) => {
      if (profile) {
        setUser(profile);
      }
    });
    loadRooms();
  }, []);

  async function loadRooms() {
    const response = await authFetch('/chat/rooms');
    if (!response.ok) {
      setRooms([]);
      return;
    }
    const data = await response.json();
    setRooms(data);
    if (data.length && !selectedRoom) {
      setSelectedRoom(data[0]);
    }
  }

  useEffect(() => {
    if (selectedRoom) {
      loadMessages(selectedRoom.room_id);
    }
  }, [selectedRoom]);

  async function loadMessages(roomId) {
    const response = await authFetch(`/chat/rooms/${roomId}/messages`);
    if (!response.ok) {
      setMessages([]);
      return;
    }
    const data = await response.json();
    setMessages(data);
  }

  async function handleSendMessage(event) {
    event.preventDefault();
    if (!selectedRoom || !content.trim()) {
      setStatus('Message content is required');
      return;
    }
    const formData = new FormData();
    formData.append('content', content);
    attachments.forEach((file) => formData.append('attachments', file));

    const response = await authFetch(`/chat/rooms/${selectedRoom.room_id}/messages`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      setStatus(error.error || 'Unable to send message');
      return;
    }

    const message = await response.json();
    setMessages([...messages, message]);
    setContent('');
    setAttachments([]);
    setStatus('Message sent');
  }

  async function createRoom() {
    if (!newRoomTitle.trim()) {
      setStatus('Room title is required.');
      return;
    }

    const payload = {
      title: newRoomTitle,
      participants: newRoomParticipants
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean),
    };

    const response = await authFetch('/chat/rooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      setStatus(error.error || 'Unable to create room');
      return;
    }

    const room = await response.json();
    setRooms([room, ...rooms]);
    setSelectedRoom(room);
    setNewRoomTitle('');
    setNewRoomParticipants('');
    setStatus('Room created');
  }

  return (
    <Layout title="Clinical Chat">
      <div className="page-container">
        <h2>Clinical Chat</h2>
        <p>Use this secure platform for nurse-doctor, doctor-doctor, and nurse-nurse collaboration with optional document upload.</p>
        {user && <p>Signed in as: {user.name} ({user.role})</p>}

        <section className="chat-layout">
          <aside className="chat-sidebar">
            <h3>Chat Rooms</h3>
            {rooms.length ? (
              <ul>
                {rooms.map((room) => (
                  <li key={room.room_id}>
                    <button type="button" onClick={() => setSelectedRoom(room)} className={selectedRoom?.room_id === room.room_id ? 'active' : ''}>
                      {room.title}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No chat rooms available.</p>
            )}
          </aside>

          <section className="chat-main">
            <div className="chat-room-creation">
              <h4>Create New Room</h4>
              <label>
                Room title
                <input value={newRoomTitle} onChange={(event) => setNewRoomTitle(event.target.value)} placeholder="New room title" />
              </label>
              <label>
                Participant IDs (comma-separated)
                <input value={newRoomParticipants} onChange={(event) => setNewRoomParticipants(event.target.value)} placeholder="user_id1,user_id2" />
              </label>
              <button type="button" onClick={createRoom}>Create Room</button>
            </div>
            {selectedRoom ? (
              <>
                <h3>{selectedRoom.title}</h3>
                <div className="chat-messages">
                  {messages.length ? (
                    messages.map((message) => (
                      <div key={message.message_id} className="chat-message">
                        <div className="message-header">
                          <strong>{message.sender_id}</strong>
                          <span>{new Date(message.sent_at).toLocaleString()}</span>
                        </div>
                        <p>{message.content}</p>
                        {message.attachments?.length ? (
                          <div className="message-attachments">
                            <strong>Attachments:</strong>
                            <ul>
                              {message.attachments.map((attachment) => (
                                <li key={attachment.attachment_id}>{attachment.filename}</li>
                              ))}
                            </ul>
                          </div>
                        ) : null}
                      </div>
                    ))
                  ) : (
                    <p>No messages yet.</p>
                  )}
                </div>

                <form onSubmit={handleSendMessage} className="chat-form">
                  <textarea value={content} onChange={(event) => setContent(event.target.value)} placeholder="Type your message" rows={4} />
                  <label>
                    Attach files, photos, or documents
                    <input type="file" multiple onChange={(event) => setAttachments(Array.from(event.target.files))} />
                  </label>
                  <button type="submit">Send Message</button>
                </form>
                {status && <p className="status">{status}</p>}
              </>
            ) : (
              <p>Select a room to view messages.</p>
            )}
          </section>
        </section>
      </div>
      <style jsx>{`
        .page-container { padding: 16px; }
        .chat-layout { display: flex; gap: 24px; margin-top: 16px; }
        .chat-sidebar { width: 240px; border-right: 1px solid #ddd; padding-right: 16px; }
        .chat-sidebar ul { list-style: none; padding: 0; }
        .chat-sidebar li { margin-bottom: 8px; }
        .chat-sidebar button { width: 100%; padding: 8px 12px; border: none; background: #f2f2f2; cursor: pointer; }
        .chat-sidebar button.active { background: #0070f3; color: white; }
        .chat-main { flex: 1; }
        .chat-messages { border: 1px solid #ddd; border-radius: 8px; min-height: 320px; padding: 12px; background: white; margin-bottom: 16px; }
        .chat-message { margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid #f0f0f0; }
        .message-header { display: flex; justify-content: space-between; gap: 8px; font-size: 14px; color: #444; }
        .chat-form textarea { width: 100%; padding: 10px; margin-bottom: 12px; border-radius: 6px; border: 1px solid #ccc; }
        .chat-form label { display: block; margin-bottom: 12px; }
        .chat-form input[type='file'] { display: block; margin-top: 6px; }
        .chat-form button { background: #0070f3; color: white; padding: 10px 16px; border: none; border-radius: 6px; cursor: pointer; }
        .status { margin-top: 12px; color: #555; }
      `}</style>
    </Layout>
  );
}
