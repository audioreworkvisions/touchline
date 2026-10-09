targetScope = 'resourceGroup'

@description('Azure region with Container Apps availability')
param location string = resourceGroup().location
@maxLength(20)
param appName string = 'touchline-demo'
@description('Previously pushed public image, including immutable tag or digest. For private registries configure managed identity + AcrPull before deployment.')
param image string
param azureOpenAiEndpoint string
param azureOpenAiDeployment string
@secure()
param azureOpenAiKey string
@secure()
@minLength(24)
param apiToken string
@description('Restrict the demo to these trusted public IPv4 CIDRs. At least one is required. Widen only intentionally for judging.')
@minLength(1)
param allowedCidrs array

resource logs 'Microsoft.OperationalInsights/workspaces@2023-09-01' = {
  name: '${appName}-logs'
  location: location
  properties: {
    sku: { name: 'PerGB2018' }
    retentionInDays: 30
    workspaceCapping: { dailyQuotaGb: 1 }
  }
}

resource environment 'Microsoft.App/managedEnvironments@2025-01-01' = {
  name: '${appName}-env'
  location: location
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: logs.properties.customerId
        sharedKey: logs.listKeys().primarySharedKey
      }
    }
  }
}

resource app 'Microsoft.App/containerApps@2025-01-01' = {
  name: appName
  location: location
  properties: {
    managedEnvironmentId: environment.id
    configuration: {
      activeRevisionsMode: 'Single'
      ingress: {
        external: true
        targetPort: 8080
        transport: 'http'
        allowInsecure: false
        ipSecurityRestrictions: [for (cidr, index) in allowedCidrs: {
          name: 'trusted-${index}'
          ipAddressRange: cidr
          action: 'Allow'
        }]
      }
      secrets: [
        { name: 'azure-openai-key', value: azureOpenAiKey }
        { name: 'touchline-api-token', value: apiToken }
      ]
    }
    template: {
      containers: [{
        name: 'touchline'
        image: image
        resources: { cpu: json('0.5'), memory: '1Gi' }
        env: [
          { name: 'PORT', value: '8080' }
          { name: 'HOST', value: '0.0.0.0' }
          { name: 'AZURE_OPENAI_ENDPOINT', value: azureOpenAiEndpoint }
          { name: 'AZURE_OPENAI_DEPLOYMENT', value: azureOpenAiDeployment }
          { name: 'AZURE_OPENAI_API_KEY', secretRef: 'azure-openai-key' }
          { name: 'TOUCHLINE_API_TOKEN', secretRef: 'touchline-api-token' }
        ]
        probes: [
          { type: 'Liveness', httpGet: { path: '/api/health', port: 8080 }, initialDelaySeconds: 10, periodSeconds: 30 }
          { type: 'Readiness', httpGet: { path: '/api/health', port: 8080 }, initialDelaySeconds: 5, periodSeconds: 10 }
        ]
      }]
      scale: { minReplicas: 0, maxReplicas: 1 }
    }
  }
}
output appUrl string = 'https://${app.properties.configuration.ingress.fqdn}'
