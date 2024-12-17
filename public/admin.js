const fileUploadForm = document.getElementById('file-upload-form');
const fileNameInput = document.getElementById('file-name');
const fileContentInput = document.getElementById('file-content');
const filesTable = document.getElementById('files-table').getElementsByTagName('tbody')[0];
const personalFileUploadForm = document.getElementById('personal-file-upload-form');
const personalFileInput = document.getElementById('personal-file');
const apiUrl = "https://specific-christye-avoriovietnam-a5af5ba3.koyeb.app"; 
// Hàm tải danh sách files
const fetchFiles = async () => {
    try {
        const response = await fetch(`${apiUrl}/api/files`);
        const files = await response.json();
        filesTable.innerHTML = ''; // Xóa các dòng hiện tại
        files.forEach(file => {
            const row = filesTable.insertRow();
            const idCell = row.insertCell();
            const nameCell = row.insertCell();
            const actionsCell = row.insertCell();
            idCell.textContent = file.id;
            nameCell.textContent = file.filename;
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.addEventListener('click', () => deleteFile(file.id));
            actionsCell.appendChild(deleteButton);
        });
    } catch (error) {
        console.error('Error fetching files:', error);
    }
};

// Hàm xóa file
const deleteFile = async (fileId) => {
    try {
        const response = await fetch(`${apiUrl}/api/files/${fileId}`, {
            method: 'DELETE',
        });
        if (response.ok) {
            fetchFiles(); // Tải lại danh sách files
        } else {
            console.error('Failed to delete file');
        }
    } catch (error) {
        console.error('Error deleting file:', error);
    }
};

// Xử lý upload file products.json
fileUploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fileName = fileNameInput.value;
    const fileContent = fileContentInput.value;

    try {
        const response = await fetch(`${apiUrl}/api/upload-products-file`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                fileName,
                fileContent,
            }),
        });

        if (response.ok) {
            alert('Products file uploaded successfully!');
            fileNameInput.value = '';
            fileContentInput.value = '';
            fetchFiles(); // Tải lại danh sách files
        } else {
            const errorData = await response.json();
            alert(`Error uploading products file: ${errorData.error}`);
        }
    } catch (error) {
        console.error('Error uploading products file:', error);
        alert('Error uploading products file. Please check console for details.');
    }
});

// Xử lý upload file cá nhân
personalFileUploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const file = personalFileInput.files[0];
    if (!file) {
        alert('Please select a file.');
        return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch(`${apiUrl}/api/upload-personal-file`, {
            method: 'POST',
            body: formData,
        });

        if (response.ok) {
            alert('File uploaded successfully!');
            personalFileInput.value = '';
            fetchFiles();
        } else {
            const errorData = await response.json();
            alert(`Error uploading file: ${errorData.error}`);
        }
    } catch (error) {
        console.error('Error uploading file:', error);
        alert('Error uploading file. Please check console for details.');
    }
});

// Tải danh sách files khi trang được load
fetchFiles();