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
    command: ["cat"]
    tty: true

  - name: kubectl
    image: bitnami/kubectl:latest
    command: ["cat"]
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
    image: docker:24-dind
    securityContext:
      privileged: true
    env:
    - name: DOCKER_TLS_CERTDIR
      value: ""
    command:
    - dockerd-entrypoint.sh
    args:
    - --host=unix:///var/run/docker.sock
    - --storage-driver=overlay2
    volumeMounts:
    - name: docker-storage
      mountPath: /var/lib/docker
    - name: docker-config
      mountPath: /etc/docker/daemon.json
      subPath: daemon.json

  volumes:
  - name: docker-storage
    emptyDir: {}
  - name: docker-config
    configMap:
      name: docker-daemon-config
  - name: kubeconfig-secret
    secret:
      secretName: kubeconfig-secret
'''
        }
    }

    environment {
        // -------- SONAR CONFIG --------
        PROJECT_KEY   = "2401107_Sem2"
        PROJECT_NAME  = "2401107_Sem2"
        SONAR_URL     = "http://my-sonarqube-sonarqube.sonarqube.svc.cluster.local:9000"
        SONAR_SOURCES = "."

        // -------- DOCKER CONFIG --------
        IMAGE_LOCAL   = "babyshield:latest"
        REGISTRY      = "nexus-service-for-docker-hosted-registry.nexus.svc.cluster.local:8085"
        REGISTRY_PATH = "smruti-project/babyshield-frontend"
        IMAGE_TAGGED  = "${REGISTRY}/${REGISTRY_PATH}:v${env.BUILD_NUMBER}"

        // -------- K8S CONFIG --------
        NAMESPACE     = "2401107"
    }

    stages {

        stage('Checkout Code') {
            steps {
                git url: 'https://github.com/Smruti2506/E_vaccination_deploy.git', branch: 'main'
            }
        }

        stage('Build Docker Image') {
            steps {
                container('dind') {
                    sh '''
                        echo "⏳ Waiting for Docker daemon..."
                        until docker info > /dev/null 2>&1; do
                          sleep 3
                        done

                        echo "🐳 Building Docker Image..."
                        docker build -t ${IMAGE_LOCAL} .
                        docker image ls
                    '''
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                container('sonar-scanner') {
                    withCredentials([string(credentialsId: 'sonar-token-2401107', variable: 'SONAR_TOKEN')]) {
                        sh '''
                            echo "🔍 Running Sonar Scanner..."

                            sonar-scanner \
                              -Dsonar.projectKey=${PROJECT_KEY} \
                              -Dsonar.projectName=${PROJECT_NAME} \
                              -Dsonar.sources=${SONAR_SOURCES} \
                              -Dsonar.host.url=${SONAR_URL} \
                              -Dsonar.token=${SONAR_TOKEN} \
                              -Dsonar.sourceEncoding=UTF-8
                        '''
                    }
                }
            }
        }

        stage('Login to Docker Registry') {
            steps {
                container('dind') {
                    sh '''
                        until docker info > /dev/null 2>&1; do
                          sleep 3
                        done

                        docker --version
                        docker login ${REGISTRY} -u admin -p Changeme@2025
                    '''
                }
            }
        }

        stage('Tag & Push Image') {
            steps {
                container('dind') {
                    sh '''
                        echo "📤 Tagging & Pushing Image..."
                        docker tag ${IMAGE_LOCAL} ${IMAGE_TAGGED}
                        docker push ${IMAGE_TAGGED}
                    '''
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                container('kubectl') {
                    sh '''
                        echo "🚀 Deploying BabyShield..."
                        kubectl apply -f babyshield-deployment.yaml
                        kubectl rollout status deployment/babyshield-deployment -n ${NAMESPACE}
                    '''
                }
            }
        }
    }
}