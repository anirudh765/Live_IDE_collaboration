import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { Editor } from '@monaco-editor/react'; 

const socket = io('http://localhost:5000');

function App() {
    const [code, setCode] = useState('// Start coding here\n'); 
    const [files, setFiles] = useState([]); 

    // WebSocket: Real-time updates
    useEffect(() => {
        socket.on('update', (newCode) => {
            setCode(newCode);
        });

        return () => {
            socket.off('update');
        };
    }, []);

    // Handle editor changes and send updates via WebSocket
    const handleEditorChange = (newValue) => {
        setCode(newValue);
        socket.emit('message', newValue); 
    };

    const fetchFiles = async () => {
        try {
            const response = await axios.get('http://localhost:5000/files');
            setFiles(response.data);
        } catch (error) {
            console.error('Error fetching files:', error);
        }
    };

    // Fetch file list on initial load and whenever a new file is saved
    useEffect(() => {
        fetchFiles();
    }, []);

    // Fetch the content of a specific file and display it in the editor
    const handleFileSelect = async (filename) => {
        try {
            const response = await axios.get(`http://localhost:5000/files/${filename}`);
            setCode(response.data); 
            alert(`Loaded file: ${filename}`);
        } catch (error) {
            console.error('Error loading file:', error);
            alert('Failed to load file content. Please try again.');
        }
    };

    const handleSaveToStorj = async () => {
        const filename = prompt('Enter the filename to save:'); 
        if (!filename) {
            alert('Filename cannot be empty.');
            return;
        }
        try {
            const response = await axios.post('http://localhost:5000/upload', {
                filename,
                content: code,
            });
            alert(response.data.message);
            fetchFiles(); 
        } catch (error) {
            console.error('Error saving file to STORJ:', error);
            alert('Failed to save file to STORJ.');
        }
    };

    return (
        <div>
            <h1>Simple Web IDE</h1>

            <h2>STORJ File List:</h2>
            <ul>
                {files.map((file) => (
                    <li key={file.Key}>
                        <button onClick={() => handleFileSelect(file.Key)}>{file.Key}</button>
                    </li>
                ))}
            </ul>
            
            <button onClick={handleSaveToStorj} style={{ marginBottom: '10px' }}>
                Save to STORJ
            </button>

            <Editor
                marginBottom= "20px"
                height="500px"
                language="javascript"
                theme="vs-dark"
                value={code}
                onChange={handleEditorChange}
            />
        </div>
    );
}

export default App;
