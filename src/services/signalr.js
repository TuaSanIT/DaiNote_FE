import * as signalR from '@microsoft/signalr';

const connection = new signalR.HubConnectionBuilder()
  .withUrl(`${process.env.VUE_APP_API_BASE_URL}/chatHub`, {
    withCredentials: true,
    skipNegotiation: true,
    transport: signalR.HttpTransportType.WebSockets
  })
  .configureLogging(signalR.LogLevel.Information)
  .build();

connection.on('ReceiveMessage2', (user, message) => {
  console.log(`${user} says ${message}`);
});

connection.on('ReceivePrivateMessage', (message) => {
  console.log('Private message received:', message);
});

connection.on('UpdateUsersList', (users) => {
  console.log('Connected users:', users);
});


async function startSignalRConnection() {
  try {
    await connection.start();
    console.log('SignalR Connected.');
  } catch (err) {
    console.error('Error while starting connection:', err);
    setTimeout(() => startSignalRConnection(), 5000);
  }
}

connection.onclose(() => startSignalRConnection());

startSignalRConnection();

export default connection;
