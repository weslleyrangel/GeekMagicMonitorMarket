const { execFile } = require('child_process');

const args = [
  '-v',
  '-m', '10',
  '-F', 'imageFile=@temp_frame.jpg;type=image/jpeg;filename=file1.jpg',
  'http://192.168.1.2/upload'
];

execFile('curl.exe', args, { cwd: __dirname }, (err, stdout, stderr) => {
  console.log('Error:', err ? err.message : 'none');
  console.log('Stdout:', stdout);
  console.log('Stderr (last 300 chars):', stderr.slice(-300));
});
