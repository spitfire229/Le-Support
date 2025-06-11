# server/server.py
import asyncio
import websockets
import keyboard

async def handle_client(websocket):  # plus de `path`
    print("Client connecté !")
    try:
        async for message in websocket:
            print(f"Reçu : {message}")
            # Envoie la touche reçue au clavier
            if len(message) == 1:
                keyboard.press_and_release(message)
            elif message == "enter":
                keyboard.press_and_release("enter")
            elif message == "backspace":
                keyboard.press_and_release("backspace")
            else:
                print(f"Touche non prise en charge : {message}")
    except websockets.exceptions.ConnectionClosed:
        print("Client déconnecté.")

async def main():
    async with websockets.serve(handle_client, "0.0.0.0", 8765):
        print("Serveur en attente sur ws://0.0.0.0:8765 ...")
        await asyncio.Future()  # Attend indéfiniment

if __name__ == "__main__":
    asyncio.run(main())
