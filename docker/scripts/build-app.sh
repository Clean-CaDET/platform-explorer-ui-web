DATASET_EXPLORER_API_URL=$1

export API_HOST=${DATASET_EXPLORER_API_URL}
envsubst < ./docker/front/environment.ts.template > ./src/environments/environment.ts || exit
npm run build --prod && \
cd dist && \
mv "$(find . -maxdepth 1 -type d | tail -n 1)" /app
