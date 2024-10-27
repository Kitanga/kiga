const { readdir, readFile, mkdir } = require("node:fs/promises");
const { join } = require('node:path');
const sharp = require('sharp');

const img_folder = join(import.meta.dir, 'public/assets/img');
const preprocessed_img_folder = join(import.meta.dir, '__research-sunbaked/preprocessed');

const hasIMGFolder = (await readdir('./public/assets')).some(item => item == 'img');

try {
    !hasIMGFolder && mkdir(img_folder);
} catch(err) {}

// read all the files in the current directory
const preprocessed_files = await readdir(preprocessed_img_folder);

console.log(preprocessed_files);

preprocessed_files.forEach(async file => {
    await readFile(join(preprocessed_img_folder, file)).then(buf => {
        const sharpFile = sharp(buf);

        return sharpFile
            // .avif({
            //     effort: 9,
            //     // quality: 9,
            // }).toFile(join('img', file.replace(/.webp|.png|.jpg|.jpeg/g, '.avif')));
            .png({
                effort: 9,
            }).toFile(join(img_folder, file.replace(/.webp|.png|.jpg|.jpeg/g, '.png')));
    });
});
