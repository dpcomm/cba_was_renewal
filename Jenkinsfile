pipeline {
  agent { label 'joey-host' }
  options { disableConcurrentBuilds() }

  environment {
    REGISTRY = "ap-chuncheon-1.ocir.io"
    NAMESPACE = "axdhp42jvukm"
    IMAGE_NAME = "cba_was_renew"
    IMAGE_LATEST = "${REGISTRY}/${NAMESPACE}/${IMAGE_NAME}:latest_dev"
    IMAGE_TAGGED = "${REGISTRY}/${NAMESPACE}/${IMAGE_NAME}:dev-${BUILD_NUMBER}"
  }

  stages {
    stage('Checkout') {
      steps { checkout scm }
    }

    stage('Copy env file') {
      steps {
        withCredentials([
          file(credentialsId: 'env-dev', variable: 'ENV_DEV'),
        ]) {
          sh '''
            set -e
            rm -f .env.dev
            cp "$ENV_DEV" .env.dev
            chmod 600 .env.dev
          '''
        }
      }
    }

    stage('Install dependencies') {
      steps {
        sh '''
          set -e
          npm ci
        '''
      }
    }

    stage('Run tests') {
      steps {
        sh '''
          set -e
          npm test -- --runInBand
        '''
      }
    }

    stage('Login OCI') {
      steps {
        withCredentials([usernamePassword(credentialsId: 'oci-registry-joey-local', usernameVariable: 'OCI_USER', passwordVariable: 'OCI_PASS')]) {
          sh '''
            set -e
            echo "$OCI_PASS" | docker login ${REGISTRY} -u "$OCI_USER" --password-stdin
          '''
        }
      }
    }

    stage('Buildx Push') {
      steps {
        sh '''
          set -e
          docker buildx inspect multiarch-builder >/dev/null 2>&1 || docker buildx create --use --name multiarch-builder
          docker buildx inspect --bootstrap
          docker buildx build \
            --platform linux/amd64,linux/arm64 \
            -t ${IMAGE_LATEST} \
            -t ${IMAGE_TAGGED} \
            --push .
        '''
      }
    }

    stage('Deploy') {
      steps {
        build job: 'cba-deploy-was_all-dev', wait: false
      }
    }
  }
}
