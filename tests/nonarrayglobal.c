int happiness = 70;
int sadness;

void putchar(int);

void anotherFunction() {
    putchar(sadness);
    sadness++;
}

void main() {
    putchar(happiness);
    sadness = 71;
    anotherFunction();
    putchar(sadness);
}
