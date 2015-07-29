void putchar(char);
void puts(char*);

struct hello {
    int i;
    int j;
    struct hello* nextNode;
    char* someText;
};

void main() {
    struct hello world;
    world.i = 65;
    world.j = 66;
    world.nextNode = &world;
    world.someText = "Hello, World!";
    world.nextNode->i = 'Z';

    putchar(world.i); // A
    putchar(world.j); // B
    putchar(world.nextNode->i); // A
    putchar(world.nextNode->j); // B
    puts(world.someText); // Hello, World!
}
