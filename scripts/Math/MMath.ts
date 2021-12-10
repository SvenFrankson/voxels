class MMath {

    public static Clamp(v: number, min: number, max: number): number {
        return Math.min(Math.max(v, min), max);
    }
}