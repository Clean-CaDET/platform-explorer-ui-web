Requirements: Docker

Steps:
1. open terminal, run command **git clone https://github.com/Clean-CaDET/platform-explorer-ui-web.git**
2. position terminal in **platform-explorer-ui-web** folder
3. run command **docker build -t angular-docker .**
4. run command **docker run -p 4200:4200 angular-docker**
