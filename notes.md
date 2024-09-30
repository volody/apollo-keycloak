To integrate Keycloak as a Docker container with an Apollo Server in a Node.js environment, follow these steps:

## Step 1: Set up Keycloak in Docker

Pull Keycloak Docker Image: Start by pulling the official Keycloak image from Docker Hub:

```bash
docker pull quay.io/keycloak/keycloak:latest
```

Run Keycloak Container: Run the Keycloak server with the following command. This sets the initial admin user and runs the container.

```bash
docker run -d --name keycloak \
  -e KEYCLOAK_ADMIN=admin \
  -e KEYCLOAK_ADMIN_PASSWORD=admin \
  -p 8080:8080 \
  quay.io/keycloak/keycloak:latest start-dev
```

## Step 2: Access the Keycloak Admin Console

Open your browser and go to http://localhost:8080. You should see the Keycloak welcome page.

### Click on "Administration Console."

Log in using the admin credentials (admin/admin).
Create a Realm: A realm in Keycloak is a space where you manage objects such as users, clients, and roles.

### Go to Realms and click Add Realm.

Name your realm (e.g., myrealm) and click Create.
Create a Client: A client in Keycloak is an application that users log in to.

### Go to Clients and click Create.

- Enter the Client ID (e.g., apollo-client).
- Set Client Protocol to openid-connect.
- Set Client authentication of the client to ON => the credentials of the client must be configured under the Credentials tab.
- Check `Service accounts roles`
- Add a valid redirect URL (http://localhost:4000/\*).
- Click Save.

More [info](https://www.keycloak.org/docs/latest/server_admin/index.html#assembly-managing-clients_server_administration_guide)

After saving, you'll see a Client Secret in the Credentials tab. Copy this value; you’ll need it later.

## Step 2: Run Apollo Server

node index.js

## Step 3: Test Keycloak Authentication

Get the token

```bash
curl --request POST \
  --url http://localhost:8080/realms/myrealm/protocol/openid-connect/token \
  --header 'Content-Type: application/x-www-form-urlencoded' \
  --data 'grant_type=client_credentials&client_id=apollo-client&client_secret=YOUR_CLIENT_SECRET'
```

Test GraphQL Endpoint with Authentication:

```bash
curl --request POST \
  --url http://localhost:4000/graphql \
  --header 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
  --header 'Content-Type: application/json' \
  --data '{"query":"{ hello }"}'
```

save token before post

```bash
TOKEN=$(curl --request POST \
  --url http://localhost:8080/realms/myrealm/protocol/openid-connect/token \
  --header 'Content-Type: application/x-www-form-urlencoded' \
  --data 'grant_type=client_credentials&client_id=apollo-client&client_secret=hBqNZluipOwaHBHFvOhRpKTmDdKhMr5C' \
  | jq -r .access_token)

curl --request POST \
  --url http://localhost:4000/graphql \
  --header "Authorization: Bearer $TOKEN" \
  --header 'Content-Type: application/json' \
  --data '{"query":"{ hello }"}'
```

curl --request POST --url http://localhost:4000/graphql --header 'Content-Type: application/json' --data '{"query":"{ hello }"}'
