## Getting Started

These instructions will show you how to get a copy of the project and how to deploy the project on a live system.

Create web folder:\
`sudo mkdir -p /var/www/3d-app/`

Clone the repository to your web folder:\
`git clone https://github.com/geolba/GeotiefExplore.git /var/www/3d-app/`

Switch to the repo folder:\
`cd /var/www/3d-app/`

Copy the example env file and make the required configuration changes in the .env file
`cp .env.example .env`

 `.env` - Environment variables can be set in this file
Configure your database connection in .env-file e.g.:
`nano .env`

```ini
NODE_ENV=production
```

Update npm dependencies:\
`npm update`

Build production files:\
`npm run prod`

## License

This project is licensed under the MIT License - see the [license](LICENSE) file for details
