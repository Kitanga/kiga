export const getResourceLink = (url: string) => {
    const link = `./${url}`
        .replaceAll('://', '%404%HTTP')
        .replaceAll('//', '/')
        .replaceAll('%404%HTTP', '://');

    console.log('link:', link)

    return link;
}