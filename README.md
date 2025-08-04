# Microservice 2025 - Kubernetes Deployment

A scalable microservice application demonstrating modern containerized architecture with Node.js API service and MySQL database running on Kubernetes.

## Table of Contents

- [Project Overview](#project-overview)
- [Architecture Features](#architecture-features)
- [Repository and Docker URLs](#repository-and-docker-urls)
- [Quick Start](#quick-start)
- [Service API Tier](#service-api-tier)
- [Configuration](#configuration)
- [Security](#security)
- [Video Demonstration](#video-demonstration)

## Project Overview

This project showcases a production-ready microservice architecture with:
- **API Service Tier**: Node.js/Express REST API (4 replicas with rolling updates)
- **Database Tier**: MySQL 8.4 with persistent storage (StatefulSet with 1 replica)
- **Container Orchestration**: Kubernetes with proper resource management
- **Data Persistence**: PersistentVolumes ensuring zero data loss
- **Service Discovery**: Internal communication via Kubernetes Services
- **External Access**: Ingress controller for external API exposure


## Architecture Features

### ✅ **Requirements Compliance**

| Requirement | Implementation | Status |
|-------------|----------------|---------|
| **External Access** | API: Ingress, DB: Internal only | ✅ |
| **Pod Count** | API: 4 replicas, DB: 1 replica | ✅ |
| **Rolling Updates** | API: Yes, DB: No (StatefulSet) | ✅ |
| **Persistent Storage** | API: No, DB: Yes (1Gi PV) | ✅ |
| **ConfigMap Usage** | Database config externalized | ✅ |
| **Secrets Management** | Passwords in base64 encoded secrets | ✅ |
| **Data Persistence** | Survives pod recreation | ✅ |
| **Service Communication** | No pod IPs, DNS-based routing | ✅ |

### **Technology Stack**
- **Frontend**: HTML/CSS
- **Backend**: Node.js 16+ with Express.js
- **Database**: MySQL 8.4 with connection pooling
- **Container**: Docker with Alpine Linux
- **Orchestration**: Kubernetes (GKE compatible)
- **Storage**: GCP Persistent Disks


## Repository and Docker URLs

### **Code Repository**
- **GitHub**: [Repo Link](https://github.com/chiragkohli/microservice-2025)

### **Docker Hub Images**
- **API Service**: [Docker Image](https://hub.docker.com/repository/docker/chiragkohli29/api-service)


## Quick Start

### **Prerequisites**
- Kubernetes cluster (GKE/Minikube/Kind)
- kubectl configured
- Docker Hub access

### **Deployment**
```bash
# Deploy database tier
kubectl apply -f k8s/database/

# Deploy API service tier  
kubectl apply -f k8s/api-service/

# Verify deployment
kubectl get all
```

### **Access Application**
```bash
# Ingress (wait for external IP)
kubectl get ingress api-service-ingress
```


## Service API Tier
### **Service API Endpoints** 
*Access via Ingress External IP*


## Configuration

### **Environment Variables**
- `DB_HOST`: Database service endpoint
- `DB_USER`: Database username  
- `DB_PASS`: Database password (from Secret)
- `DB_NAME`: Database name
- `DB_PORT`: Database port


## Security

- ✅ **No hardcoded passwords** - All secrets in Kubernetes Secrets
- ✅ **Base64 encoded sensitive data**
- ✅ **ConfigMap for non-sensitive configuration**
- ✅ **Internal service communication only**
- ✅ **Resource limits to prevent resource exhaustion**


## Video Demonstration
- **Screen Recording:** [Video URL](<video-url>)