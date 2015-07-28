; ModuleID = 'tests/helloworld.c'
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v64:64:64-v128:128:128-a0:0:64-s0:64:64-f80:128:128-n8:16:32:64-S128"
target triple = "x86_64-apple-macosx10.9.0"

@.str = private unnamed_addr constant [45 x i8] c"\0AUntil a proper standard library is setup, \0A\00", align 1
@.str1 = private unnamed_addr constant [52 x i8] c"There has to be a reference to every library call.\0A\00", align 1
@.str2 = private unnamed_addr constant [23 x i8] c"Without further ado..\0A\00", align 1
@.str3 = private unnamed_addr constant [15 x i8] c"Hello, World!\0A\00", align 1
@.str4 = private unnamed_addr constant [18 x i8] c"Hello, World, 2!\0A\00", align 1

define void @main() nounwind ssp uwtable {
  call void @putch(i32 65)
  call void @puts(i8* getelementptr inbounds ([45 x i8]* @.str, i32 0, i32 0))
  call void @puts(i8* getelementptr inbounds ([52 x i8]* @.str1, i32 0, i32 0))
  call void @puts(i8* getelementptr inbounds ([23 x i8]* @.str2, i32 0, i32 0))
  call void @puts(i8* getelementptr inbounds ([15 x i8]* @.str3, i32 0, i32 0))
  call void @puts(i8* getelementptr inbounds ([18 x i8]* @.str4, i32 0, i32 0))
  ret void
}

declare void @putch(i32)

declare void @puts(i8*)
