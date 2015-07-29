/*
 * port of ECCE editor to Scratch
 * modified by gtoal for scratch-llvm syntax
 * THE CODE BELOW IS NOT A PART OF SCRATCH-LLVM,
 * AND IS NOT LICENSED UNDER SCRATCH-LLVM'S LICENSE
 */

#include <stdio.h>
#include <stdlib.h>

static int instream = 0, outstream = 0;

int trap (int mask)
{
  return (0);
}

void
dosignal (int i, int j, int k)
{
  if (i == 0)
    exit (0);
  exit (1);
}

int
consoleget (void)
{
  int c;
  c = getchar();
  return c;
}

int
fileget (int stream)
{
  return -1;
}

void
putsym (int c)
{
}

void
psym (int c)
{
  putchar(c);
}

void
xprompt (int c)
{
  putchar(c);
}

static int min;
static int sin;
static int stop;
static int in;
static int mon;
static int casebit;
static int print1;
static int print2;
static int sextra;
static int pp1;
static int sym;
static int code;
static int text;
static int num;
static int cbase;
static int tbase;
static int ci;
static int ti;
static int cmax;
static int c[121];
static int stored[193];
static int pos1;
static int pos2;
static int pos3;
static int bufmax;
static int top;
static int bot;
static int a[510001];
static int lbeg;
static int pp;
static int fp;
static int lend;
static int fend;
static int ms;
static int ml;
static int type;
static int chain;
static int pend;
static int mfp;
static int mlend;
static int mend;
static int sfp;
static int send;
const int symtype[96] =
  { 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
0, 0, 0, 0, 0, 0, 0, 0, 64, 3, 3, 3, 2, 3, 3, 11, 9, 64, 3, 12, 2, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0,
0, 0, 3, 1, 3, 3, 3, 64, 3, 18, 10, 26, 5, 8, 52, 10, 2, 6, 10, 10, 122, 56, 2, 2, 10, 50, 10,
22, 5, 117, 6, 2, 32, 32, 32, 3, 10, 3, 3, 3 };
static int i;
static int j;
static int k;
static int nl;
static int k;
static int k;
static int p1;
static int p2;
static int p;
static int i;
static int j;
static int k;
static int l;
static int t1;
static int fp1;
static int lim;

int
mainfp (void)
{
  if (in == min)
    return fp;
  return mfp;
}

void
readsym (void)
{
  if (pend != 0)
    {
      sym = pend;
      pend = 0;
    }
  else
    for (;;)
      {
	if (pos3 == 0)
	  {
	    sym = consoleget ();
	    return;
	  }
	sym = stored[pos3];
	pos3 = pos3 + 1;
	if (sym != 0)
	  return;
	pos3 = pos2;
	pos2 = pos1;
	pos1 = 0;
      }
}

int
readitem (void)
{
  do
    {
      type = 1;
      do
	{
	  readsym ();
	  if (sym < 0)
	    return -1;
	}
      while (sym == ' ');
      if (sym < ' ')
	return 0;
      if (sym >= 96)
	sym = sym - 32;
      type = symtype[sym];
      if ((type & 15) != 0)
	return 0;
      if (type == 32)
	{
	  pos1 = pos2;
	  pos2 = pos3;
	  pos3 = (sym - 'X' << 6) + 1;
	}
    }
  while (type == 32);
  if (type == 0)
    {
      num = sym - '0';
      for (;;)
	{
	  readsym ();
	  if (sym < 0)
	    return 0;
	  pend = sym;
	  if (sym < '0')
	    return 0;
	  if (sym > '9')
	    return 0;
	  pend = 0;
	  num = num * 10 - '0' + sym;
	}
    }
  else
    {
      type = 0;
      num = 0;
      if (sym == '*')
	return 0;
      num = stop + 1;
      if (sym == '?')
	return 0;
      num = stop;
    }
  return 0;
}


void main() {
    for(;;) {
        psym(consoleget());
    }
}
