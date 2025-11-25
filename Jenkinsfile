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
    image: docker:dind
    args: ["--storage-driver=overlay2"]
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

    environment {
        PROJECT_NAME  = "BabyShield"
        SONAR_SOURCES = "."
        IMAGE_LOCAL   = "babyshield:latest"

        // CHANGE THIS (your actual SonarQube k8s service)
        SONAR_URL     = "http://sonarqube-sonarqube.sonarqube.svc.cluster.local:9000"

        // CHANGE THIS (your actual registry host + repo path)
        REGISTRY      = "nexus-service-for-docker-hosted-registry.nexus.svc.cluster.local:8085"
        REGISTRY_PATH = "smruti-project/babyshield"

        IMAGE_TAGGED  = "${REGISTRY}/${REGISTRY_PATH}:v${env.BUILD_NUMBER}"
        NAMESPACE     = "2401107"
    }

    stages {

        stage('Checkout Code') {
            steps {
                git url: 'https://github.com/Smruti2506/E_vaccination_deploy.git', branch: 'main'
            }
        }

        stage('SonarQube Analysis') {
            steps {
                container('sonar-scanner') {
                    withCredentials([string(credentialsId: 'sonar-token-2401107', variable: 'SONAR_TOKEN')]) {
                        sh '''
                            echo "🔍 Running Sonar Scanner..."

                            sonar-scanner \
                              -Dsonar.projectKey=${PROJECT_NAME} \
                              -Dsonar.sources=${SONAR_SOURCES} \
                              -Dsonar.host.url=${SONAR_URL} \
                              -Dsonar.token=${SONAR_TOKEN}
                        '''
                    }
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                container('dind') {
                    sh '''
                        echo "🐳 Building Docker Image..."
                        docker build -t ${IMAGE_LOCAL} .
                        docker image ls
                    '''
                }
            }
        }

        stage('Login to Docker Registry') {
            steps {
                container('dind') {
                    withCredentials([usernamePassword(
                        credentialsId: 'nexus-docker-2401107',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )]) {
                        sh '''
                            echo "🔐 Logging into Docker Registry..."
                            echo $DOCKER_PASS | docker login ${REGISTRY} -u $DOCKER_USER --password-stdin
                        '''
                    }
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
