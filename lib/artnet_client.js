const dgram = require('dgram');
const { Buffer } = require('buffer');

/**
 * Class representing an ArtNet client.
 * This client can send data to ArtNet-compatible devices over a network.
 */
class ArtNetClient {
    /**
     * Create an ArtNetClient.
     * @param {string} host - The destination IP address. Defaults to the broadcast address.
     * @param {number} port - The destination port. Defaults to 6454, the standard ArtNet port.
     * @param {number} universe - The ArtNet universe to address. Defaults to 0.
     */
    constructor(host = '255.255.255.255', port = 6454, universe = 0) {
        this._host = host; // Host IP address
        this._port = port; // Port number
        this._socket = dgram.createSocket('udp4'); // Create a UDP socket

        // Bind the socket and enable broadcasting
        this._socket.bind(() => {
            this._socket.setBroadcast(true); // Enable broadcasting
        });

        // Initialize ArtNet protocol header components
        this.HEADER = [65, 114, 116, 45, 78, 101, 116, 0, 0, 80, 0, 14]; // ArtNet packet header bytes
        this.SEQUENCE = [0]; // Sequence byte
        this.PHYSICAL = [0]; // Physical input port
        this.UNIVERSE = [universe & 0xFF, (universe >> 8) & 0xFF]; // Universe bytes (split into two 8-bit values)
        // this.LENGTH = [0, 13]; // Length bytes (commented out, not used)
    }

    /**
     * Send data to the ArtNet universe.
     * @param {Array} data - The data to send.
     */
    send(data) {
        const length_upper = Math.floor(data.length / 256); // Upper byte of data length
        const length_lower = data.length % 256; // Lower byte of data length

        // Construct the complete ArtNet packet
        const packet = this.HEADER.concat(this.SEQUENCE).concat(this.PHYSICAL).concat(this.UNIVERSE).concat([length_upper, length_lower]).concat(data);
        const buf = Buffer(packet); // Convert packet to buffer

        // Send the buffer to the specified host and port
        this._socket.send(buf, 0, buf.length, this._port, this._host, function () { });
    }

    /**
     * Set the universe for the ArtNet client.
     * @param {number} universe - The new universe to set.
     */
    setUniverse(universe) {
        // Update the UNIVERSE property by splitting the 16-bit universe value into two 8-bit values
        this.UNIVERSE = [universe & 0xFF, (universe >> 8) & 0xFF];
    }

    /**
     * Close the UDP socket used by the ArtNet client.
     */
    close() {
        this._socket.close(); // Close the socket
    }
}

// Export the ArtNetClient class
exports.ArtNetClient = ArtNetClient;

/**
* Factory function to create a new ArtNetClient instance.
* @param {string} host - The destination IP address.
* @param {number} port - The destination port.
* @param {number} universe - The ArtNet universe to address.
* @returns {ArtNetClient} A new instance of ArtNetClient.
*/
exports.createClient = function (host, port, universe) {
    return new ArtNetClient(host, port, universe);
}

