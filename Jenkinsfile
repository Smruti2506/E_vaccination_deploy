pipeline {
    agent {
        kubernetes {
            yaml '''
apiVersion: v1
kind: Pod
spec:
  containers:
  - name: sonar-scanner
    image: sonarsource/sonar-scanner-cli
    command:
    - cat
    tty: true

  - name: kubectl
    image: bitnami/kubectl:latest
    command:
    - cat
    tty: true
    securityContext:
      runAsUser: 0
      readOnlyRootFilesystem: false
    env:
    - name: KUBECONFIG
      value: /kube/config        
    volumeMounts:
    - name: kubeconfig-secret
      mountPath: /kube/config
      subPath: kubeconfig

  - name: dind
    image: docker:dind
    args: ["--registry-mirror=https://mirror.gcr.io", "--storage-driver=overlay2"]
    securityContext:
      privileged: true
    env:
    - name: DOCKER_TLS_CERTDIR
      value: ""
    volumeMounts:
    - name: docker-config
      mountPath: /etc/docker/daemon.json
      subPath: daemon.json

  volumes:
  - name: docker-config
    configMap:
      name: docker-daemon-config
  - name: kubeconfig-secret
    secret:
      secretName: kubeconfig-secret
'''
        }
    }

    stages {

        /* ---------------------- CHECKOUT ----------------------- */
        stage('Declarative: Checkout SCM') {
            steps {
                checkout scm
            }
        }

        /* -------------------- DOCKER BUILD --------------------- */
        stage('Build Docker Image') {
            steps {
                container('dind') {
                    sh '''
                        sleep 10
                        docker build -t babyshield:latest .
                        docker image ls
                    '''
                }
            }
        }

        /* -------------------- SONARQUBE ------------------------ */
        stage('SonarQube Analysis') {
            steps {
                container('sonar-scanner') {
                    withCredentials([string(credentialsId: 'sonar-token-2401107', variable: 'SONAR_TOKEN')]) {
                        sh '''
                            sonar-scanner \
                                -Dsonar.projectKey=Babyshieldtoken \
                                -Dsonar.projectName=Babyshieldtoken \
                                -Dsonar.sources=. \
                                -Dsonar.host.url=http://my-sonarqube-sonarqube.sonarqube.svc.cluster.local:9000 \
                                -Dsonar.login=$SONAR_TOKEN \
                                -Dsonar.sourceEncoding=UTF-8
                        '''
                    }
                }
            }
        }

        /* ---------------- PUSH TO NEXUS DOCKER ---------------- */
        stage('Push to Registry') {
            steps {
                container('dind') {
                    sh '''
                        docker login nexus-service-for-docker-hosted-registry.nexus.svc.cluster.local:8085 \
                        -u admin -p Changeme@2025

                        docker tag babyshield:latest \
                        nexus-service-for-docker-hosted-registry.nexus.svc.cluster.local:8085/babyshield/babyshield:v1

                        docker push \
                        nexus-service-for-docker-hosted-registry.nexus.svc.cluster.local:8085/babyshield/babyshield:v1
                    '''
                }
            }
        }

        /* ---------------- KUBERNETES DEPLOYMENT -------------- */
        stage('Deploy to Kubernetes') {
            steps {
                container('kubectl') {
                    sh '''
                        kubectl apply -f babyshield-deployment.yaml
                        kubectl rollout status deployment/babyshield-deployment -n 2401107
                    '''
                }
            }
        }
    }
}
