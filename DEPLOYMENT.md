# Deployment Guide: Hosting on a VPS

This guide assumes you have a Virtual Private Server (VPS) running Ubuntu (common for hosting) and you want to deploy the `video-compression-api` using Docker.

## Prerequisites

1.  **A VPS**: DigitalOcean Droplet, AWS EC2, Linode, etc. (Ubuntu 20.04/22.04 recommended).
2.  **Domain Name** (Optional): If you want a custom domain (e.g., `api.yourdomain.com`).
3.  **SSH Access**: You should be able to log in to your VPS terminal.

---

## Step 1: Push Local Changes

Your Docker configuration files (`Dockerfile`, `docker-compose.yml`, etc.) are currently **untracked** in your local git repository. You must commit and push them so they are available on the VPS.

Run these commands in your local terminal:

```bash
git add .
git commit -m "Add Docker configuration and documentation"
git push origin main
```

---

## Step 2: Prepare the VPS

Connect to your VPS:

```bash
ssh root@your-vps-ip
```

### Install Docker & Git

Run the following commands to install Docker and Git on your VPS:

```bash
# Update packages
sudo apt update && sudo apt upgrade -y

# Install prerequisites
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common git

# Add Docker's official GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Add Docker repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Verify Docker is running
sudo systemctl status docker
```

---

## Step 3: Deploy the Application

### 1. Clone the Repository

Navigate to where you want the app (e.g., `/opt` or `~/app`):

```bash
cd ~
git clone https://github.com/Hyacinth-Chidi/video-compression-api.git
cd video-compression-api
```

### 2. Configure Environment Variables

Create the `.env` file on the server. You can copy the example from your local machine, but **change the passwords/secrets**.

```bash
nano .env
```

Paste your environment variables (example):

```env
PORT=3000
NODE_ENV=production
# Add other config here
```

Press `Ctrl+X`, then `Y`, then `Enter` to save.

### 3. Create Upload Directories

Ensure the volume directories exist (Docker usually creates them, but good to be sure):

```bash
mkdir -p uploads compressed
```

### 4. Start the Application

Run Docker Compose in detached mode:

```bash
docker compose up -d --build
```

(Note: If `docker compose` doesn't work, try `docker-compose` with a hyphen).

### 5. Check Logs

Verify everything is running smoothly:

```bash
docker compose logs -f
```

---

## Step 4: Accessing the API

If you didn't set up a firewall or reverse proxy yet, your API should be accessible at:
`http://<your-vps-ip>:3000`

Test it:

```bash
curl http://localhost:3000/health
```

## Step 5: (Optional) Setup Nginx & SSL (HTTPS)

For a production app, you should use Nginx as a reverse proxy and get a free SSL certificate from Let's Encrypt.

1.  **Install Nginx**: `sudo apt install nginx -y`
2.  **Configure Nginx**: Create a new config file `/etc/nginx/sites-available/video-api`.
    ```nginx
    server {
        server_name api.yourdomain.com_or_IP;

        location / {
            proxy_pass http://localhost:3000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;

            # Increase upload size for videos
            client_max_body_size 500M;
        }
    }
    ```
3.  **Enable Site**: `sudo ln -s /etc/nginx/sites-available/video-api /etc/nginx/sites-enabled/`
4.  **Restart Nginx**: `sudo systemctl restart nginx`
5.  **SSL (Certbot)**: `sudo apt install certbot python3-certbot-nginx -y`
6.  **Get Cert**: `sudo certbot --nginx -d api.yourdomain.com`

---

## Updating the App

To deploy new changes in the future:

1.  SSH into VPS.
2.  Navigate to app dir: `cd ~/video-compression-api`
3.  Pull changes: `git pull origin main`
4.  Rebuild & Restart: `docker compose up -d --build`
