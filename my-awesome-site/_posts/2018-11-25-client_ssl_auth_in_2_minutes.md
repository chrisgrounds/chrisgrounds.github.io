---
title: Client SSL Auth In 2 Minutes
layout: post
published: true
---

### Generate CA root private key

```
openssl genrsa -des3 -out root-ca.key 1024
```

### Use the key to generate and sign its own cert

```
openssl req -new -x509 -days 3650 -key root-ca.key -out root-ca.crt -config openssl.cnf 
```

## Client

### Create private key and certificate

```
openssl req -newkey rsa:1024 -keyout chris.key -config openssl.cnf -out chris.csr
```

### Use the CA root cert to sign the client certificate

```
openssl ca -keyfile root-ca.key -cert root-ca.crt -out chris.crt -infiles chris.csr
```


### Troubleshoting 

Create the index.txt file.

```
touch /etc/pki/CA/index.txt
```

Create a serial file to label the CA and all subsequent certificates.

```
# echo '1000' > /etc/pki/CA/serial
```

You will only need to do this the first time you set up the SSL certificate. Re-run the command:

```
openssl ca -keyfile root-ca.key -cert root-ca.crt -out chris.crt -infiles chris.csr
```

#### References

- http://pages.cs.wisc.edu/~zmiller/ca-howto/
- https://access.redhat.com/documentation/en-US/Red_Hat_Enterprise_Virtualization/3.2/html/Developer_Guide/Creating_an_SSL_Certificate.html
