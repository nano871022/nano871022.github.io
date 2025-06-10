FROM ubuntu:24.04 
RUN apt update -y && apt upgrade -y 
RUN apt install git -y
RUN apt install curl -y && apt install nano -y
RUN apt install openjdk-11-jdk -y
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash
RUN . ~/.nvm/nvm.sh && nvm install --lts 
RUN . ~/.nvm/nvm.sh use --lts
WORKDIR /project
VOLUME /project/code
VOLUME /project/logs
EXPOSE 5000
CMD ["sleep","infinity"]