# therealbrbweekly.com-node-server
I wrote this node server to handle the back end and frontend services for therealbrbweekly.com.
BRB Weekly is a satorical newspaper writen by my younger sister you can check out the deployed website and her work at therealbrbweekly.com.
the server is built around the concept of splitting the destructive and non destructive operations of a restful API between the local and public networks,
This made it much faster for me to code this project because I did not have to set up a full authentication system.  
I should point out that this is not a very secure way of doing things if you were to deploy this server on a public network like a business network,
Any one on the same LAN as the server would have unrestricted access to modifying the website.  
however I am deploying this server on my home network and I live in the middle of a field so the chances of some one unintended accessing the website is very very low.  
In terms of how this actually works app.js starts two separate servers on two separate ports, One of them is the public and the other is the private server.
it also opens several data bases one apiece for handling: image metadata, PDF metadata, articles and request logging each of these databases is a LevelDB database' 
If you've never tried out Level databases I would highly recommend them they are much much much simpler than SQL based databases.
I used the following packages from NPM in this project: express, LevelDB, EJS and Multer.
the project I will admit is quite a mess and could really use some spring cleaning, there's a lot of code that's duplicated or just outwrite no longer in use.
I could have spent more time polishing this project however I have been working on this for quite some time and I really just want it finished, Preferably before Coursera steals another 50.00$ of my money. 
I mostly just put this project on git hub for my Coursera course however if there's any code you think you can use for any thing feel free to use it for whatever you want, Just note I used AI for some of this project you have been warned.
You can run this like any other node appliaction with: node app.js
