#!/bin/sh

mc alias set local http://chatpdf-minio:9000 wKoxIXEmEX00OwOJ xL9.CaGNR#nIEZ0m=NoD#pwX8nwFNM7e

# Wait until Minio is ready
until mc ls local; do
  echo "Waiting for Minio to be ready..."
  sleep 1
done

# Check if the bucket "chatpdf-bucket" exists
if mc ls local/chatpdf-bucket 2>/dev/null; then
  echo "Bucket chatpdf-bucket already exists. Exiting..."
  exit 0
fi

# Execute your mc commands

#mc admin info local

mc mb local/chatpdf-bucket
echo "created bucket chatpdf-bucket"
mc admin user add local pDLNypgWK4n4IidH 6pvgqJI9Bhxn0bEYp5NEk8xS8wDHW4ox
echo "created credentials for bucket and app chatpdf"

# Define a policy in a JSON file
echo '{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:ListBucket", "s3:GetBucketLocation"],
      "Resource": ["arn:aws:s3:::chatpdf-bucket"]
    },
    {
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:PutObject", "s3:ListMultipartUploadParts", "s3:AbortMultipartUpload"],
      "Resource": ["arn:aws:s3:::chatpdf-bucket/*"]
    }
  ]
}' > /tmp/chatpdf-policy.json

# Set the policy for the user

mc admin policy create local chatpdf-policy /tmp/chatpdf-policy.json

# Attach the policy to the user
mc admin policy attach local chatpdf-policy --user pDLNypgWK4n4IidH






