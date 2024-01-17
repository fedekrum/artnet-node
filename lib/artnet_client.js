var dgram = require('dgram');
var Buffer = require('buffer').Buffer;

// ArtNetClient constructor
// host - IP address for the client (default is broadcast address)
// port - port number (default is 6454, the standard ArtNet port)
function ArtNetClient(host = '255.255.255.255', port = 6454) {
    this._host = host;  // Host IP address
    this._port = port;  // Port number
    this._socket = dgram.createSocket("udp4");  // Create a UDP socket

    // Bind the socket and enable broadcast
    this._socket.bind(() => {
        this._socket.setBroadcast(true);  // Enable broadcasting
    });

    // ArtNet protocol header
    this.HEADER = [65, 114, 116, 45, 78, 101, 116, 0, 0, 80, 0, 14]; // ArtNet packet header bytes
    this.SEQUENCE = [0]; // Sequence byte
    this.PHYSICAL = [0]; // Physical input port
    this.UNIVERSE = [0, 0]; // Universe bytes
    //this.LENGTH = [0, 13]; // Length bytes (commented out, not used)
}

// Export ArtNetClient constructor
exports.ArtNetClient = ArtNetClient;

// Factory function to create a new ArtNetClient instance
exports.createClient = function(host, port) {
    return new ArtNetClient(host, port);
}

// Send method for ArtNetClient
ArtNetClient.prototype.send = function(data) {
    // Calculate the length of the data packet
    var length_upper = Math.floor(data.length / 256);  // Upper byte of the length
    var length_lower = data.length % 256;              // Lower byte of the length
    
    // Construct the full data packet
    var data = this.HEADER.concat(this.SEQUENCE).concat(this.PHYSICAL).concat(this.UNIVERSE).concat([length_upper, length_lower]).concat(data);
    var buf = Buffer(data);  // Convert data to a buffer

    // Send the buffer to the specified host and port
    this._socket.send(buf, 0, buf.length, this._port, this._host, function(){});
}

// Close method for ArtNetClient
ArtNetClient.prototype.close = function(){
    this._socket.close();  // Close the UDP socket
};
