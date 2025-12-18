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
    command: ["dockerd-entrypoint.sh"]
    args: ["--host=unix:///var/run/docker.sock"]
    volumeMounts:
    - name: docker-storage
      mountPath: /var/lib/docker

  volumes:
  - name: docker-storage
    emptyDir: {}
  - name: kubeconfig-secret
    secret:
      secretName: kubeconfig-secret
'''
        }
    }

    environment {
        PROJECT_KEY  = "2401107_Sem2"
        PROJECT_NAME = "2401107_Sem2"
        SONAR_URL    = "http://my-sonarqube-sonarqube.sonarqube.svc.cluster.local:9000"

        IMAGE_LOCAL  = "babyshield:latest"
        REGISTRY     = "nexus-service-for-docker-hosted-registry.nexus.svc.cluster.local:8085"
        IMAGE_TAGGED = "${REGISTRY}/smruti-project/babyshield-frontend:v${BUILD_NUMBER}"

        NAMESPACE    = "2401107"
    }

    stages {

        stage('Checkout') {
            steps {
                git url: 'https://github.com/Smruti2506/E_vaccination_deploy.git', branch: 'main'
            }
        }

        stage('Build Image') {
            steps {
                container('dind') {
                    sh '''
                    until docker info; do sleep 3; done
                    docker build -t babyshield:latest .
                    '''
                }
            }
        }

        stage('SonarQube Scan') {
            steps {
                container('sonar-scanner') {
                    withCredentials([string(credentialsId: 'sonar-token-2401107', variable: 'SONAR_TOKEN')]) {
                        sh '''
                        sonar-scanner \
                        -Dsonar.projectKey=${PROJECT_KEY} \
                        -Dsonar.projectName=${PROJECT_NAME} \
                        -Dsonar.sources=. \
                        -Dsonar.host.url=${SONAR_URL} \
                        -Dsonar.token=${SONAR_TOKEN}
                        '''
                    }
                }
            }
        }

        stage('Push Image') {
            steps {
                container('dind') {
                    sh '''
                    docker login ${REGISTRY} -u admin -p Changeme@2025
                    docker tag babyshield:latest ${IMAGE_TAGGED}
                    docker push ${IMAGE_TAGGED}
                    '''
                }
            }
        }

        stage('Deploy') {
            steps {
                container('kubectl') {
                    sh '''
                    kubectl apply -f babyshield-deployment.yaml
                    kubectl rollout restart deployment/babyshield-deployment -n ${NAMESPACE}
                    kubectl rollout status deployment/babyshield-deployment -n ${NAMESPACE} --timeout=180s
                    '''
                }
            }
        }
    }
}
