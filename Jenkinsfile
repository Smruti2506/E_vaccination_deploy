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
      image: docker:dind
      args: ["--registry-mirror=https://mirror.gcr.io","--storage-driver=overlay2"]
      securityContext:
        privileged: true
      env:
        - name: DOCKER_TLS_CERTDIR
          value: ""
  volumes:
    - name: kubeconfig-secret
      secret:
        secretName: kubeconfig-secret
'''
        }
    }

    stages {

        /* -----------------------------------
         *   1. Build Docker Image (Nginx)
         * ----------------------------------- */
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

        /* -----------------------------------
         *   2. SonarQube Static Scan
         * ----------------------------------- */
        stage('SonarQube Analysis') {
            steps {
                container('sonar-scanner') {
                    withCredentials([string(credentialsId: 'sonar-token-2401107', variable: 'SONAR_TOKEN')]) {
                        sh '''
                            sonar-scanner \
                                -Dsonar.projectKey=Babyshieldtoken \
                                -Dsonar.projectName=Babyshieldtoken \
                                -Dsonar.sources=. \
                                -Dsonar.host.url=http://localhost:9000 \
                                -Dsonar.login=$SONAR_TOKEN \
                                -Dsonar.sourceEncoding=UTF-8
                        '''
                    }
                }
            }
        }

        /* -----------------------------------
         *   3. Push Docker Image to Nexus
         * ----------------------------------- */
        stage('Push to Registry') {
            steps {
                container('dind') {
                    sh '''
                        docker login nexus-service-for-docker-hosted-registry.nexus.svc.cluster.local:8085 \
                        -u admin -p Changeme@2025

                        docker tag babyshield:latest \
                        nexus-service-for-docker-hosted-registry.nexus.svc.cluster.local:8085/2401107/babyshield:v1

                        docker push \
                        nexus-service-for-docker-hosted-registry.nexus.svc.cluster.local:8085/2401107/babyshield:v1
                    '''
                }
            }
        }

        /* -----------------------------------
         *   4. Kubernetes Deployment
         * ----------------------------------- */
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
