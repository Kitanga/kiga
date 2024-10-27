import { HALF_GAME_SIZE, BUCKET_WIDTH, BUCKET_HEIGHT } from "../../constants";

export function getBucketKey(x: number, y: number, half_game_size = HALF_GAME_SIZE, bucket_width = BUCKET_WIDTH, bucket_height = BUCKET_HEIGHT) {
    const [bucketX, bucketY] = getBucketPos(x, y, half_game_size, bucket_width, bucket_height);

    // return Math.min(bucket_width - 1, bucketX) + ':' + Math.min(bucket_height - 1, bucketY);
    return (Math.min(bucket_width - 1, bucketX) << 4) | Math.min(bucket_height - 1, bucketY);
}

export function getBucketPos(x: number, y: number, half_game_size: number, bucket_width: number, bucket_height: number) {
    const bucketX = Math.floor((x + half_game_size) / bucket_width);
    const bucketY = Math.floor((y + half_game_size) / bucket_height);

    return [bucketX, bucketY];
}

export function getBucketName(x: number, y: number, half_game_size = HALF_GAME_SIZE, bucket_width = BUCKET_WIDTH, bucket_height = BUCKET_HEIGHT) {
    const [bucketX, bucketY] = getBucketPos(x, y, half_game_size, bucket_width, bucket_height);

    return Math.min(bucket_width - 1, bucketX) + ':' + Math.min(bucket_height - 1, bucketY);
}

export function getBucketIX(x: number, y: number, half_game_size = HALF_GAME_SIZE, bucket_width = BUCKET_WIDTH, bucket_height = BUCKET_HEIGHT) {
    const [bucketX, bucketY] = getBucketPos(x, y, half_game_size, bucket_width, bucket_height);

    return Math.min(bucket_height - 1, bucketY) * bucket_width + Math.min(bucket_width - 1, bucketX);
}