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
        IMAGE_LOCAL = "babyshield:latest"
        REGISTRY = "nexus-service-for-docker-hosted-registry.nexus.svc.cluster.local:8085"
        REGISTRY_PATH = "smruti-project/babyshield"
        IMAGE_TAGGED = "${REGISTRY}/${REGISTRY_PATH}:v${env.BUILD_NUMBER}"

        SONAR_PROJECT = "BabyShield"
        NAMESPACE = "2401107"
    }

    stages {

        /* --------------------------------------- *
         * 1. Build Docker Image
         * --------------------------------------- */
        stage('Build Docker Image') {
            steps {
                container('dind') {
                    sh '''
                      echo "Building BabyShield Docker Image..."
                      sleep 10
                      docker build -t ${IMAGE_LOCAL} .
                      docker image ls
                    '''
                }
            }
        }

        /* --------------------------------------- *
         * 2. SonarQube Analysis
         * --------------------------------------- */
        stage('SonarQube Analysis') {
            steps {
                container('sonar-scanner') {
                    withCredentials([string(credentialsId: 'sonar-token-2401107', variable: 'SONAR_TOKEN')]) {
                        sh '''
                            sonar-scanner \
                              -Dsonar.projectKey=BabyShield \
                              -Dsonar.sources=. \
                              -Dsonar.host.url=http://sonarqube-sonarqube.sonarqube.svc.cluster.local:9000
                              -Dsonar.token=$SONAR_TOKEN
                        '''
                    }
                }
            }
        }

        /* --------------------------------------- *
         * 3. Login to Registry
         * --------------------------------------- */
        stage('Login to Docker Registry') {
            steps {
                container('dind') {
                    withCredentials([usernamePassword(
                        credentialsId: 'nexus-docker-2401107',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )]) {
                        sh '''
                          echo $DOCKER_PASS | docker login ${REGISTRY} -u $DOCKER_USER --password-stdin
                        '''
                    }
                }
            }
        }

        /* --------------------------------------- *
         * 4. Tag & Push Image
         * --------------------------------------- */
        stage('Build - Tag - Push Image') {
            steps {
                container('dind') {
                    sh '''
                        docker tag ${IMAGE_LOCAL} ${IMAGE_TAGGED}
                        docker push ${IMAGE_TAGGED}
                    '''
                }
            }
        }

        /* --------------------------------------- *
         * 5. Deploy to Kubernetes
         * --------------------------------------- */
        stage('Deploy to Kubernetes') {
            steps {
                container('kubectl') {
                    sh '''
                      kubectl apply -f babyshield-deployment.yaml -n ${NAMESPACE}
                      kubectl rollout status deployment/babyshield-deployment -n ${NAMESPACE}
                    '''
                }
            }
        }
    }
}
