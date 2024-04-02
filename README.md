# Start-up guide for users

Tested on Windows 10 and 11<br>
Requirements: git ([Git for Windows](https://git-scm.com/download/win)), Docker ([Docker for Windows](https://docs.docker.com/desktop/install/windows-install/))

Steps:
1. open terminal in the desired folder on the computer, run command **git clone https://github.com/Clean-CaDET/platform-explorer-ui-web.git**
2. position terminal in **platform-explorer-ui-web** folder (run command **cd platform-explorer-ui-web**)
3. run command **docker build -t angular-docker .**
4. run command **docker run -p 4200:4200 angular-docker**

The application is available at http://localhost:4200 but it is necessary to start the back-end of application so that the functionalities are available. The instructions for the back-end are [here](https://github.com/Clean-CaDET/dataset-explorer/blob/master/SETUP.md).


# Start-up guide for developers

Tested on Windows 10
Requirements: 

Steps:

