#!/bin/bash
cd /home/ec2-user/TrafficShield
sudo su
echo "Starting server..."
pm2 start server.js --name "TrafficShield" --watch