#!/usr/bin/python

# frontend to meowcc
# the Scratch linker <3
# llvm-link a.ll b.ll -f | llvm-dis

import sys
import subprocess
import argparse

# parse arguments in pretty way

parser = argparse.ArgumentParser(description='Frontend to meowcc')
parser.add_argument("--output", "-o", help="output file")
parser.add_argument("--username", help="Scratch username")
parser.add_argument("--project", "-pid", help="Project ID to upload to")
parser.add_argument("--compile", "-c", help="Skip linking step", action='store_true')

parser.add_argument("files", metavar='F', nargs="+")

args = parser.parse_args()

projectName = args.output or args.project

# first, compile any C program into LLVM

llvmFiles = []

for file in args.files:
    extension = file.split(".")[-1]

    # if it is an llvm file, we don't need to do anything
    # but if it is a c file, we need to compile it

    if extension == 'll':
        llvmFiles.append(file)
    elif extension == 'c':

        # compile this into ll, then add it to the list
        # if this is a compile only build, we need to output .o instead

        if args.compile:
            subprocess.call(["clang", "-Oz", "-S", "-emit-llvm", file, "-o", ".".join(file.split(".")[0:-1]) + ".o"])
        else:
            subprocess.call(["clang", "-Oz", "-S", "-emit-llvm", file])

        # this will now be the same file with a .ll extension
        # do some string twiddling and be on our way <3

        llvmFiles.append(".".join(file.split(".")[0:-1]) + ".ll")
    elif extension == 'o':
        # they're not actually object files,
        # just ll files in disguise :)

        llvmFiles.append(file)
    else:
        print "Unknown file extension for file " + file

if args.compile: # just generate .o, nothing else
    exit()

# unfortunately, scratch-llvm only works with a single llvm file
# link them here <3

# TODO: mitigate the shell=True security risk...
subprocess.call("llvm-link "+ (" ".join(llvmFiles)) + " -f | llvm-dis > " + projectName + ".lll", shell=True)
inputFile = projectName + ".lll"

# finally, make the actual call

meowcc = sys.argv[0][0:-len("scratchcc.py")] + "meowcc.js"

if args.output:
    subprocess.call("node " + meowcc + " "+inputFile+" > "+args.output, shell=True)
elif args.project:
    subprocess.call("node " + meowcc + " "+inputFile+" "+args.username+" "+args.project, shell=True)
else:
    subprocess.call("node " + meow + " " +inputFile, shell=True)
