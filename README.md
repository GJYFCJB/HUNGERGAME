
## Introduction:
This project is a web-based online multiplayer game, and name is hungerplay. Like all modern online games, players can play with others on the platform by their account.

The game has 3 parts: The **platform**, **game**, and the **settings**.

Under the sign-up button, players can make their account by typing in the account name and password.

Once players have created the account, players can log in with them; after they log in, they can see 3 selections on the main menu: 

* ‘Single player’ means offline game; players will play with robots. 

* ‘Multiple players’ means an online game. Players will match with other players who have similar ranks or score with them.

* Settings contain some configurations like avatar, sound, and map. Players can uphold avatars or change configurations here.

Once players selected the game modal, players will jump to the game page: 
The game is a shooting game; players can move shots and blink. The skills icon shows on the bottom right corner, and for each release of skills, the corresponding icon will be dynamically covered to display the freeze of the skills.

* Players move by right click on the map.

* Players can shoot enemies by left click the mouse, and the freeze time of this skill is 2s.

* Players can blink (move to the destination directly) by pressing ‘F’ and right-clicking on the map. The freeze time of this skill is 5s.

Attack effect: 

Once players are attacked, players will get hit back, the movement speed will be 10% slower than before, and the players’ area will be 20% smaller. 
Also, the bullets have a range limit; when players get shot, there will be red particles showing.

When players defeat all others, there will be ‘Chicken dinner’ words show, and when players died, ‘You failed’ will show.

Under the multiplayer modal, the game will start if at least 3 players match. There is a notice board on the head of the map to show how many players have joined the room. Once the player count is fulfilled, players can start the game.

Players can chat with others by pressing ‘enter’ on the keyboard. When ‘enter’ is pressed, a chat box will show on the bottom left corner, and it will disappear if you click ‘enter again.’ 

The chat history will show above the chat box when someone speaks, and it will stay 2s if no one speak again. 

To develop this project, I need to config the tools like docker and AWS, deploy Nginx, and realize a real-time match and play system.

## Background:
    
### File and system Structure 
To develop this project, I need to have a plan and create a structure for it. 
So I design the file and system structure for this project like below:
```	
	System:  
  <img width="434" alt="image" src="https://user-images.githubusercontent.com/89375316/214735918-57c8ccf5-1f10-4cf0-a522-58ebd4daa73c.png">

	File:
•	Templates: Manage HTML
•	Urls: Manage url and path
•	Views: Manage Http request
•	Models: Database
•	Static: For static files like CSS, JavaScript, Image, and audio.
•	Consumers: WebSocket
```
The biggest problem with this structure is that as the Brower will run JavaScript files from top to end, so I need to make sure I develop Js code in a separate file but run it in a single file. 

There are some modern pack tools like webpack, but as I develop just one main page, so I write a package script by myself. The script can pack all Js files under the src file into one file in the dist file. 
	 
### Game design

<img width="310" alt="image" src="https://user-images.githubusercontent.com/89375316/214735963-5aa31d4e-5fa4-49c2-bdf7-52278cae433e.png">

The next step is the game design. 
Like modern games, this game relies on the game engine, too. The game engine is a top-level class, like the object class in JavaScript. I name this object as GameObject.

The GameObject has methods to control its lifetime. Each object has below lifetime:
```
•	Start: only execute at the first frames.
•	Update: execute each frame.
•	On_destroy: only execute before the object is deleted.
•	Destroy: delete the game object.
•	Animation: will render the object by timestamp (the time interval between this frame and the last frame) and recursive call.
The recursive call of the animation method may cause the tail behind game objects when they are moving. 
```
### Tools and tech

*	Server: AWS EC2.-> EC2 has a free economic trier policy.
*	Container: Docker. -> Use docker to transfer the project to a different cloud easily.
*	Domain and web: Route53, Nginx, and WebSocket for the online game.
*	Database: SQLite and Redis, real-time online games need a lower delay.
*	Tmux and PyCharm.
Language: Python, JavaScript, CSS, HTML.
Why WebSocket? 
*	The TCP protocol corresponds to the transport layer, while the HTTP and WebSocket protocols correspond to the application layer; both HTTP and WebSocket are built on top of the TCP
*	HTTP will establish a connection channel to the server through TCP. When the data required for this request is completed, Http will immediately disconnect the TCP connection. This process is very short.
*	The HTTP connection is a short connection and a stateless connection. The so-called stateless means that every time the browser initiates a request to the server, it does not pass a connection but establishes a new connection every time.
*	The method of using the HTTP protocol to achieve two-way communication is polling and long polling. These two methods have two major drawbacks:
    * For example, assuming that the data update speed on the server side is very fast, the server must wait for the next Get request from the client after sending a data packet to the client before delivering the second updated data packet to the client. If the network is congested, this time is unacceptable to the user
    * Since the header data of the HTTP data packet is often large (usually more than 400 bytes), but the data actually required by the server is very small (sometimes only about 10 bytes), such data packets are cycled on the network Sexual transmission inevitably wastes network bandwidth.
*	WebSocket is an extension of the HTTP protocol. Ports 80 and 443 can support both WebSocket and HTTP. It must rely on the HTTP protocol for a handshake. After the handshake is successful, the data is directly transmitted from the TCP channel, which has nothing to do with HTTP.
*	Once both client and server have sent their handshake, if the handshake is successful, the transfer data part begins. This is a two-way transmission channel, and each end can send data independently and at will. and is a long connection
*	Realize the frame mechanism on TCP and back and forth the IP packet mechanism without length limitation. Much smaller than HTTP request headers.

## Solution Description:
### Tool and certificate:

####	 AWS tools:
a.	I deploy this project on AWS EC2 so first I need to apply and config one EC2 server: 
*	Login AWS account and search EC2: 

<img width="468" alt="image" src="https://user-images.githubusercontent.com/89375316/214735997-628670df-e7ad-4a10-aa93-d0e5430a3c70.png">
 
*	Open EC2 console and select instances on the sidebar, then launch instances.

<img width="320" alt="image" src="https://user-images.githubusercontent.com/89375316/214736017-a846d9ce-5ebb-44c6-9a12-69b1abfe7463.png">
 
*	Give a name at the name field and select ubuntu under Quick Start. Pay attention to the free tier eligible word and choose 20.04 at the dropdown.

<img width="191" alt="image" src="https://user-images.githubusercontent.com/89375316/214736031-925b8a6a-6336-4552-82a7-a584d8d37576.png">

<img width="163" alt="image" src="https://user-images.githubusercontent.com/89375316/214736037-8665713c-abd0-401e-9bee-58eca3ed9c82.png">

*	Select “create new key pair” under “key pair”, EC2 does not provide password login by default, so at first, we must use ssh to log in, the command is : 
```
ssh -i /path/key-pair-name.pem instance-user-name@instance-public-dns-name
```
And Ubuntu’s default instance user name is ubuntu.
*	Click “launch instance” in the corner.

b.	Set to login without password:

*	First set to login with password and root password instead of ssh.

Commands are: 
```
ssh -i your-key.pem username@(public-ip-address)  //login in your ubuntu server
sudo vi /etc/ssh/sshd_config //open config
PasswordAuthentication yes
Source: https://comtechies.com/password-authentication-aws-ec2.html
```
*	Create key: ssh-keygen
*	Add public key by: ssh-copy-id myserver

c.	Apply domain name by AWS

*	Search route53 at the service field, select “Registered domains” at side bar.
*	Click “register domains” and apply by steps, the domain name will show under the “host zone” after 2 hours you pay the bill.

<img width="297" alt="image" src="https://user-images.githubusercontent.com/89375316/214736063-d69b1517-79d4-42a8-826e-538169d9fbc3.png">
 
*	Click the domain name and create record:
 
 <img width="336" alt="image" src="https://user-images.githubusercontent.com/89375316/214736078-a832f8d7-ffbf-4333-b8b0-00cc6dcad221.png">

d.	Config the Niginx and apply the https certificate

*	We need to apply the certificate by letsencrypt – a free certificate publish group.
*	I use the auto-install script : https://github.com/acmesh-official/acme.sh#3-install-the-issued-cert-to-apachenginx-etc
*	Please install it under docker container environment
*	Remember change to root user by : sudo -i
*	Use Nginx command: acme.sh --issue  -d mydomain.com   --nginx
*	After the application is successful, your key and certificate will be stored in your ~/acme.sh/domain.com path Then install it to nginx with the following command: 
```
o	acme.sh --install-cert -d example.com \
o	--key-file       /path/to/keyfile/in/nginx/key.pem  \
o	--fullchain-file /path/to/fullchain/nginx/cert.pem \
o	--reloadcmd     "service nginx force-reload"
```

### Real-time online game system:
*	To realize the real-time online game, we need to use WebSocket. 
*	Clients’ facilities are different from each other, and browser window sizes can be changed, so the coordinates of other players will be different for each client. We need to unify the front-end unit.
*	Players’ information synchronization.
*	Add the multiplayer modal and related URLs.

#### Unified unit:
First, I unified the game map ratio as 16:9 and took height as unit 1. If the ratio of the browser window does not match, the smaller window length and width will be used as the length of the map. The part outside the map can do some padding.

Then, I implemented the resize method to listen to the change of browser window’s change. Each change will call the resize method.

#### WebSocket:
Django_channels is a project which can make Django handle WebSockets.

Reference: https://channels.readthedocs.io/en/stable/index.html. I use asgi.py to config channels and change the settings.py file. ASGI allows multiple asynchronous events per application.

To handle the specific requests, I write code under consumes file (similar to the views file). 
I use 
```daphne -b 0.0.0.0 -p 5015 acapp.asgi:application```command to start Django_channels.
 
Asgi.py
<img width="318" alt="image" src="https://user-images.githubusercontent.com/89375316/214736108-42da9e86-bc00-48d8-b390-ce2ffba1c73f.png">

####	Players’ information synchronization.
Design:
How to sync player information?

Integrate django_channels and implement with WebSocket:

*	Each client needs to send a request to the host in real-time, and the establishment of the "host".
*	The host also needs to send broadcasts to each client in real-time.
*	The client needs to update its own information after receiving the broadcast
What information needs to be synchronized?
*	The position of each object: by sending the move_to() function and its parameters to the server
*	Each player's instructions, including releasing various skills, sending the shoot function.

Ownership of final decision?

Due to the difference in network speed and performance of different clients in practice, there will be confusion in judging who was hit and the real position of each object on the client at the same time. 

Therefore, the decision-making power of the event is uniformly handed over to the player who releases the skill and hits it. 

As long as there is a skill hit on a certain client, regardless of the status of other people, the server will directly broadcast the xxx hit event. Once the judgment is hit, the state will be forced regardless of the client’s situation.

### Architecture:
Three parts: Frontend, URL, and communication (consumers).

Consumers: 
Create a multiplayer class extended from AsyncWebsocketConsumer. 
The AsyncWebsocketConsumer class template is: 

<img width="190" alt="image" src="https://user-images.githubusercontent.com/89375316/214736135-e8eaf01a-d11c-4f28-a720-9b46e07134ae.png">
 
There are 3 functions to realize:
*	Connect: execute when the connection is established.
*	Disconnect: run when disconnected.
*	Receive: called by the host after receiving a client message.
The host will broadcast only after receiving the message (that is, call the send function of different services).

Frontend:
The front end needs to implement a MultiPlayerSocket class to connect with the host, and realize a series of data sending and receiving host data, and make a series of corresponding processing for each.

<img width="245" alt="image" src="https://user-images.githubusercontent.com/89375316/214736171-a5165428-479d-4556-a0cd-7dede26e726d.png">

The host will call the send function of different services in different modules only after receiving the message.
URLs:
Under routing.py, add the URL.
 
 <img width="307" alt="image" src="https://user-images.githubusercontent.com/89375316/214736187-e228ca86-34bf-443e-bbae-0d94d4fac522.png">

### Match system:
I use the thrift service to realize match system. Thrift is an interface description language and binary communication protocol, which is used to define and create cross-language services.

<img width="867" alt="image" src="https://user-images.githubusercontent.com/89375316/214736218-5ac3b5c5-90a8-45fc-b8a2-8fbfa86029f3.png">

Multithread: One thread is responsible for matching, and other threads receive requests. 

When the system is matching, needs to store all the requests as cache, so need to use a message queue.

The match system(server) will process all the requests.
 
## Results:
The multiplayer online game has an authentication system, and players can log in to the platform and play in a single or multiplayer modal. 

Under the multiplayer modal, players can match with others and play together in real time. During the game, players can move, release skills, attack, and chat.

This project has success below:
*	This project solved the synchronization and match problems successfully. 
*	This game has its platform and authentication system.
*	I overcame the complex configuration steps of AWS servers and certificates and developed the game engine by imitating Unity.
*	This game can play on the webpage of any facility.
But there are also some limitations. The game needs to be more complex and funnier. The authentication system does not support the upholding of an avatar. When players are moving, there are tails behind the object.
Please see the video demo:















