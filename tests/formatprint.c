void putchar(char);
void puts(char*);

void __stub() {
    putchar(0);
}

int printf(const char* fmt, ...) {
    puts(fmt);
}
