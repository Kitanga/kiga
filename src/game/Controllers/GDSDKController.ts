export class GDSDKController {
    public static instance: GDSDKController;
    public static track = true;

    public static getInstance() {
        if (this.instance) {
            return this.instance;
        } else {
            this.instance = new GDSDKController();

            return this.instance;
        }
    }

    gdsdk: any;

    private constructor() {
        (window as any).GDSDKController = GDSDKController;

        this.gdsdk = (window as any).gdsdk;
    }

    showAd(type?: 'rewarded-ad') {
        this?.gdsdk?.showAd?.(type);
    }
}
