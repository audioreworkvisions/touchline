# Azure setup — prepared, not deployed

The complete Node application can run in Azure Container Apps. The supplied deployment deliberately reuses an **existing Azure OpenAI resource and chat model deployment** rather than silently provisioning one. Azure subscription, region, quota, model availability, access policy and budget must be selected before deployment.

## 1. Verify locally

```sh
node --test tests/*.test.mjs
node server.mjs
```

Open `http://localhost:8765`. If that port is in use, set `PORT` to another free port. The server listens only on loopback by default. Docker sets `HOST=0.0.0.0` and `PORT=8080` for the managed ingress.

## 2. Connect an existing Azure model

Copy `.env.example` to `.env` locally. Fill the resource endpoint, **deployment name** and key from your Azure resource. Generate a random API access token with at least 24 characters. Do not paste secrets into chat or commit them.

```sh
node server.mjs
```

The endpoint is the Azure resource origin, for example `https://YOUR-RESOURCE.openai.azure.com` or an Azure AI Services endpoint. The adapter loads `.env` automatically. If `AZURE_OPENAI_API_VERSION` is set, it uses the deployment route with that API version; otherwise it uses the Azure OpenAI v1 route. Use a deployment that supports Chat Completions, JSON mode and `max_completion_tokens`.

The frontend indicator will report configuration, not successful inference. Select the demo moment and click “Azure-KI formulieren”. Enter the application's **access token**, not the Azure key. Success must display “Azure OpenAI · redaktioneller Entwurf”. An unavailable or rejected response displays the rule fallback. Verify all three story languages with real calls before claiming cloud inference works.

## 3. Build the container

Requires Docker or an authorized cloud build service:

```sh
docker build -t touchline:1.0.0 .
docker run --rm -p 8765:8080 --env-file .env -e HOST=0.0.0.0 -e PORT=8080 touchline:1.0.0
```

Push the image to a registry you control. The minimal Bicep template takes a publicly pullable image reference. Prefer an immutable digest for a reviewable release. For a private Azure Container Registry, first add a user-assigned identity, AcrPull permissions and the registry configuration; private-registry authentication is not included in this minimal template.

## 4. Configure infrastructure parameters

`infra/main.bicep` creates:

- A Log Analytics workspace with 30-day retention and a 1-GB daily ingestion cap.
- A Container Apps environment.
- One application with 0.5 CPU / 1 GiB, scale-to-zero and maximum one replica, health checks, TLS ingress and explicit IP allowlist.
- Server-side secret bindings for the model key and application access token.

`infra/parameters.example.json` uses Key Vault references for secrets. Replace every `YOUR-*` placeholder. The referenced vault must support ARM template secret retrieval and the deploying identity needs the appropriate rights. Do not place actual secret values in a tracked parameter file. Use a deployment-enabled vault you control or an equivalent secure parameter flow.

Set `allowedCidrs` to the known public IP ranges that should access the demo. The template intentionally has no default universal access rule. For external judging, choose a deliberate access policy and verify that the jury can reach the app. A private Sites preview is not a substitute for that check.

## 5. Validate, review and deploy

The following are operator commands, **not commands already executed by this project**. They can create billable resources. Replace resource group and parameter-file names with your chosen values; use an existing authorized resource group or create one deliberately.

```sh
az deployment group validate --resource-group YOUR-RG --template-file infra/main.bicep --parameters @YOUR-SECURE-PARAMETERS.json
az deployment group what-if --resource-group YOUR-RG --template-file infra/main.bicep --parameters @YOUR-SECURE-PARAMETERS.json
az deployment group create --resource-group YOUR-RG --template-file infra/main.bicep --parameters @YOUR-SECURE-PARAMETERS.json
```

Review actual resource changes and the current Azure pricing for the chosen region before the final deployment. Scaling limits and log caps are useful controls but do not guarantee a fixed total bill. Configure a budget alert in the subscription. No Azure price estimate or free-tier guarantee is asserted here.

## 6. Acceptance checks on the deployed URL

1. Health endpoint returns `touchline` and the intended AI/access configuration.
2. Browser replays the match, links the six minute-62 events and creates the correct 1–1 score at the demo moment.
3. Server stream advances and resumes with the last event ID after a temporary network interruption.
4. Real model requests in DE/EN/ES return the correct evidence and appropriate copy. Manually inspect semantics, not only numeric validation.
5. The overlay appears only in its approved time window. Export a draft and an approved overlay and check their flags.
6. Requests without an access token fail; no secret appears in browser source, network responses or recordings.
7. Test the exact jury access route from the intended audience, and record the final Azure deployment and model evidence.

## Official documentation used

- [Azure OpenAI v1 API](https://learn.microsoft.com/en-us/azure/ai-foundry/openai/api-version-lifecycle?tabs=key)
- [Chat Completions REST reference](https://learn.microsoft.com/en-us/azure/foundry/openai/latest)
- [Container Apps ingress](https://learn.microsoft.com/en-us/azure/container-apps/ingress-how-to)
- [Container Apps Bicep reference](https://learn.microsoft.com/en-us/azure/templates/microsoft.app/containerapps)

The API integration and deployment source have been prepared; production suitability still requires account-specific validation and a real deployment test.
