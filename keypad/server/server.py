import asyncio
import ssl
import websockets

# Configuration SSL
ssl_context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
ssl_context.load_cert_chain(certfile="cert.pem", keyfile="key.pem")

# Handler pour les connexions WebSocket
async def echo(websocket, path):
    print("Client connecté")
    try:
        async for message in websocket:
            print(f"Message reçu : {message}")
            await websocket.send(f"Echo: {message}")
    except websockets.exceptions.ConnectionClosedOK:
        print("Client déconnecté proprement")
    except Exception as e:
        print(f"Erreur : {e}")

# Lancement du serveur WebSocket sécurisé
async def main():
    async with websockets.serve(
        echo,
        host="0.0.0.0",
        port=8765,
        ssl=ssl_context,
    ):
        print("Serveur WebSocket sécurisé démarré sur wss://localhost:8765")
        await asyncio.Future()  # Run forever

if __name__ == "__main__":
    asyncio.run(main())
