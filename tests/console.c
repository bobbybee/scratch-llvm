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

void
unchain (void)
{
  do
    {
      text = chain;
      if (text == 0)
	return;
      chain = c[text + 1];
      c[text + 1] = ci;
    }
  while (c[text] != '(');
}

void
stack (int v)
{
  c[ci] = v;
  ci = ci + 1;
}

void
readline (void)
{
  static int k;
  if (fp != fend)
    {
      lend = fp;
      for (;;)
	{
	  if (a[lend] == nl)
	    return;
	  lend = lend + 1;
	}
    }
  fp = bot - 1121;
  do
    {
      k = nl;
      if (fp != bot)
	k = fileget (in);
      if (k < 0)
	{
	  fp = bot;
	  lend = fp;
	  fend = lend;
	  a[fp] = nl;
	  goto ret;
	}
      a[fp] = k;
      fp = fp + 1;
    }
  while (k != nl);
  fend = fp;
  lend = fend - 1;
  fp = bot - 1121;
ret:
  ms = 0;
  print1 = 0;
  print2 = 0;
}

void
breakline (void)
{
  a[pp] = nl;
  pp = pp + 1;
  lbeg = pp;
}

void
leftstar (void)
{
  for (;;)
    {
      if (pp == lbeg)
	return;
      fp = fp - 1;
      pp = pp - 1;
      a[fp] = a[pp];
    }
}

void
rightstar (void)
{
  for (;;)
    {
      if (fp == lend)
	return;
      a[pp] = a[fp];
      pp = pp + 1;
      fp = fp + 1;
    }
}

void
makespace (void)
{
  static int k;
  static int p1;
  static int p2;
  if (mainfp () - pp > 240)
    return;
  p1 = top;
  p2 = p1 + lbeg >> 1;
  if (code == 'C')
    p2 = lbeg;
  if (p2 == top)
    dosignal (15, p1, p2);
  do
    {
      k = a[p1];
      putsym (k);
      p1 = p1 + 1;
      if (p1 < p2)
	k = 0;
    }
  while (k != nl);
  lbeg = top + lbeg - p1;
  p2 = pp;
  pp = top;
  for (;;)
    {
      if (p1 == p2)
	return;
      a[pp] = a[p1];
      pp = pp + 1;
      p1 = p1 + 1;
    }
}

void
refresh (void)
{
  fp = fp + 1;
  makespace ();
  readline ();
}

void
printline (void)
{
  static int p;
  print1 = lend;
  print2 = fp + pp;
  p = lbeg;
  for (;;)
    {
      if (p == pp)
	{
	  if (p != lbeg)
	    if (num == 0)
	      psym ('^');
	  p = fp;
	}
      if (p == lend)
	{
	  if (p == fend)
	    {
	      psym ('*');
	      psym ('*');
	      psym ('E');
	      psym ('n');
	      psym ('d');
	      psym ('*');
	      psym ('*');
	    }
	  psym (nl);
	  return;
	}
      psym (a[p]);
      p = p + 1;
    }
}

int
cased (int ch)
{
  if (ch < 'a')
    return ch;
  if (ch > 'z')
    return ch;
  return ch & casebit;
}

int
matched (void)
{
  static int i;
  static int j;
  static int k;
  static int l;
  static int t1;
  static int fp1;
  static int lim;
  lim = c[ci - 3] >> 7;
  t1 = cased (c[text]);
  for (;;)
    {
      pp1 = pp;
      fp1 = fp;
      if (fp != lend)
	do
	  {
	    k = a[fp];
	    if (cased (k) == t1)
	      {
		if (fp == ms)
		  {
		    if (code == 'F')
		      goto no;
		    if (code == 'U')
		      goto no;
		  }
		i = fp;
		j = text;
		do
		  {
		    i = i + 1;
		    j = j - 1;
		    l = cased (c[j]);
		    if (l == 0)
		      {
			ms = fp;
			ml = i;
			return 1;
		      }
		  }
		while (cased (a[i]) == l);
	      }
	    if (code == 'V')
	      return 0;
	  no:
	    a[pp] = k;
	    pp = pp + 1;
	    fp = fp + 1;
	  }
	while (fp != lend);
      if (code == 'V')
	return 0;
      lim = lim - 1;
      if (fp == fend)
	lim = 0;
      if (lim == 0)
	{
	  pp = pp1;
	  fp = fp1;
	  return 0;
	}
      if (code == 'U')
	pp = pp1;
      else
	breakline ();
      refresh ();
    }
}

void
main ()
{
  min = 1;
  sin = 2;
  stop = -5000;
  in = min;
  mon = 0;
  casebit = 95;
  print1 = 0;
  print2 = 0;
  sextra = 1122;
  cbase = 1;
  tbase = 120;
  cmax = 0;
  pos1 = 0;
  pos2 = 0;
  pos3 = 0;
  bufmax = 510000;
  top = 1;
  bot = 509878;
  fp = 0;
  lend = 0;
  fend = 0;
  ms = 0;
  ml = 0;
  pend = 0;
  mfp = 0;
  mlend = 0;
  mend = 0;
  sfp = 0;
  send = 0;
  nl = 10;
  psym ('E');
  psym ('C');
  psym ('C');
  psym ('E');
  psym (' ');
  psym ('0');
  psym ('6');
  psym ('/');
  psym ('0');
  psym ('1');
  psym ('/');
  psym ('8');
  psym ('1');
  psym (nl);
  pp = top - 1;
  breakline ();
  readline ();
readco:
  //fflush (0);
  xprompt ('>');
  if (in == sin)
    xprompt ('>');
  do
    {
      ci = cbase;
      ti = tbase;
      chain = 0;
      if (readitem () < 0)
	goto eof;
    }
  while (type == 1);
  if (type == 0)
    if (cmax != 0)
      {
	c[cmax + 2] = num;
	if (readitem () < 0)
	  goto eof;
	if (type != 1)
	  goto er2;
	goto execute;
      }
  if (sym == '%')
    {
      readsym ();
      if (sym < 0)
	goto eof;
      if (sym >= 96)
	sym = sym - 32;
      code = sym;
      if (code < 'A')
	goto er5;
      if (readitem () < 0)
	goto eof;
      i = symtype[code] >> 4;
    }
  else
    {
    nextunit:
      i = type & 15;
      if (i < 4)
	goto er2;
      code = sym;
      text = 0;
      num = 1;
      if (readitem () < 0)
	goto eof;
    }
  if (i == 0)
    goto er5;
  if (i == 1)
    {
      if (code == 'A')
	dosignal (0, 0, 0);
      if (code == 'S')
	{
	  goto monitor;
	}
    eof:
      code = 'C';
      for (;;)
	{
	  rightstar ();
	  if (fp == fend)
	    for (;;)
	      {
		if (top == pp)
		  dosignal (0, 0, 0);
		putsym (a[top]);
		top = top + 1;
	      }
	  breakline ();
	  refresh ();
	}
    }
  if (i == 2)
    {
      i = (code - 'X' << 6) + 1;
      if (sym == '=')
	{
	  do
	    {
	      readsym ();
	      if (sym < 0)
		goto eof;
	      if (sym != nl)
		{
		  stored[i] = sym;
		  if ((i & 63) == 0)
		    goto er6;
		  i = i + 1;
		}
	    }
	  while (sym != nl);
	  stored[i] = 0;
	  goto readco;
	}
      for (;;)
	{
	  sym = stored[i];
	  if (sym == 0)
	    {
	      psym (nl);
	      goto readco;
	    }
	  psym (sym);
	  i = i + 1;
	}
    }
  if (i == 3)
    {
      mon = 'M' - code;
      goto readco;
    }
  if (i == 4)
    if (type != 0)
      num = 0;
  if (i <= 5)
    {
      code = (num << 7) + code;
      num = 1;
      if (type == 0)
	if (readitem () < 0)
	  goto eof;
    }
  if (i <= 6)
    {
      if (type != 3)
	goto er4;
      text = ti;
      i = sym;
      for (;;)
	{
	  readsym ();
	  if (sym < 0)
	    goto eof;
	  if (sym == nl)
	    {
	      pend = sym;
	      i = sym;
	    }
	  if (sym == i)
	    {
	      if (code != 'I')
		if (code != 'S')
		  {
		    if (sym == nl)
		      goto er4;
		    if (ti == text)
		      goto er4;
		  }
	      c[ti] = 0;
	      ti = ti - 1;
	      goto ri;
	    }
	  if (ti <= ci)
	    goto er6;
	  c[ti] = sym;
	  ti = ti - 1;
	}
    }
  if (i == 7)
    {
      casebit = 95;
      if (code == 'L')
	casebit = 127;
      goto readco;
    }
  if (i == 8)
    {
      if (sym != '-')
	goto nq;
      code = code + 10;
    ri:
      if (readitem () < 0)
	goto eof;
      goto rn;
    }
  if (i == 9)
    {
      unchain ();
      if (text == 0)
	goto er3;
      c[text + 2] = num;
      text = text + 3;
    }
  if (i <= 10)
    {
    nq:
      if (type == 3)
	goto er1;
    rn:
      if (type == 0)
	if (readitem () < 0)
	  goto eof;
      goto put;
    }
  if (i == 12)
    if (type == 1)
      if (readitem () < 0)
	goto eof;
  if (i <= 12)
    {
      text = chain;
      chain = ci;
      num = 0;
    }
  if (i > 12)
    dosignal (14, 1, i);
put:
  stack (code);
  stack (text);
  stack (num);
  if (ci + 4 >= ti)
    goto er6;
  if (type != 1)
    goto nextunit;
  unchain ();
  if (text != 0)
    goto er3;
  cmax = ci;
  stack (')');
  stack (cbase);
  stack (1);
  stack (0);
  goto execute;
er1:
  psym (' ');
  psym (code);
er2:
  code = sym;
  goto er5;
er3:
  psym (' ');
  psym ('(');
  psym (')');
  goto er7;
er4:
  psym (' ');
  psym ('T');
  psym ('e');
  psym ('x');
  psym ('t');
  psym (' ');
  psym ('f');
  psym ('o');
  psym ('r');
er5:
  psym (' ');
  psym (code & 127);
  goto er7;
er6:
  psym (' ');
  psym ('S');
  psym ('i');
  psym ('z');
  psym ('e');
er7:
  psym ('?');
  psym (nl);
  if (ci != cbase)
    cmax = 0;
  for (;;)
    {
      if (sym == nl)
	goto readco;
      readsym ();
      if (sym < 0)
	goto eof;
    }
execute:
  ci = cbase;
get:
  code = c[ci] & 127;
  if (code == 0)
    goto monitor;
  text = c[ci + 1];
  num = c[ci + 2];
  ci = ci + 3;
rep:
  num = num - 1;
  if (code == 'M')
    goto xm;
  if (code == 'W')
    goto xw;
  if (code == 'L')
    goto xl;
  if (code == 'R')
    goto xr;
  if (code == 'C')
    goto xc;
  if (code == '(')
    goto xlb;
  if (code == ',')
    goto xcomma;
  if (code == ')')
    goto xrb;
  if (code == '\\')
    goto no;
  if (code == 'J')
    goto xj;
  if (code == 'K')
    goto xk;
  if (code == 'P')
    goto xp;
  if (code == 'B')
    goto xb;
  if (code == 'G')
    goto xg;
  if (code == 'I')
    goto xi;
  if (code == 'S')
    goto xs;
  if (code == 'T')
    goto xt;
  if (code == 'D')
    goto xd;
  if (code == 'U')
    goto xu;
  if (code == 'F')
    goto xf;
  if (code == 'V')
    goto xv;
  if (code == 'O')
    goto xo;
  if (code == 'E')
    goto xe;
  dosignal (14, 2, code);
ok:
  if (num == 0)
    goto get;
  if (num == stop)
    goto get;
  goto rep;
no:
  if (num < 0)
    goto get;
  if (c[ci] == '\\')
    {
      ci = ci + 3;
      goto get;
    }
skp:
  i = c[ci];
  if (i == '(')
    ci = c[ci + 1];
  ci = ci + 3;
  if (i != ',')
    if (i != ')')
      {
	if (i != 0)
	  goto skp;
	goto xer;
      }
  num = c[ci - 1] - 1;
  goto no;
xer:
  psym ('F');
  psym ('a');
  psym ('i');
  psym ('l');
  psym ('e');
  psym ('d');
  psym (' ');
  if (code == 'O')
    {
      psym ('E');
      code = '-';
    }
  else if (code == 'W')
    {
      psym ('M');
      code = '-';
    }
  psym (code);
  if (text != 0)
    {
      psym ('"');
      do
	{
	  i = c[text];
	  if (i != 0)
	    psym (i);
	  text = text - 1;
	}
      while (i != 0);
      psym ('"');
    }
  psym (nl);
  print1 = 0;
monitor:
  if (sym != nl)
    goto readco;
  if (mon < 0)
    goto readco;
  if (print1 == lend)
    {
      if (mon == 0)
	goto readco;
      if (print2 == fp + pp)
	goto readco;
    }
  num = 0;
  printline ();
  goto readco;
xlb:
  c[text + 2] = num + 1;
  goto get;
xrb:
  if (num == 0)
    goto get;
  if (num == stop)
    goto get;
  c[ci - 1] = num;
xcomma:
  ci = text;
  goto get;
xc:
  if (fp == lend)
    goto no;
  i = a[fp];
  if ((i & 95) >= 'A')
    if ((i & 95) <= 'Z')
      if ((i & 32) != 0)
	a[fp] = i - 32;
      else
	a[fp] = i + 32;
xr:
  if (fp == lend)
    goto no;
  a[pp] = a[fp];
  pp = pp + 1;
  fp = fp + 1;
  goto ok;
xl:
  if (pp == lbeg)
    goto no;
  if (in == sin)
    goto no;
  fp = fp - 1;
  pp = pp - 1;
  a[fp] = a[pp];
  ms = 0;
  goto ok;
xe:
  if (fp == lend)
    goto no;
  fp = fp + 1;
  goto ok;
xo:
  if (pp == lbeg)
    goto no;
  pp = pp - 1;
  goto ok;
xv:

xu:

xd:
xf:
  if (matched () == 0)
    goto no;
  if (code == 'U')
    pp = pp1;
  else if (code == 'D')
    fp = ml;
  goto ok;
xt:
  if (matched () == 0)
    goto no;
  do
    {
      a[pp] = a[fp];
      pp = pp + 1;
      fp = fp + 1;
    }
  while (fp != ml);
  goto ok;
xs:
  if (fp != ms)
    goto no;
  fp = ml;
xi:
  makespace ();
  if (pp - lbeg + lend - fp > 80)
    goto no;
  i = text;
  for (;;)
    {
      if (c[i] == 0)
	goto ok;
      a[pp] = c[i];
      pp = pp + 1;
      i = i - 1;
    }
xg:
  //fflush (0);
  xprompt (':');
  makespace ();
  i = consoleget ();
  if (i < 0)
    goto eof;
  if (i == ':')
    goto no;
  leftstar ();
  if (i != nl)
    do
      {
	a[pp] = i;
	pp = pp + 1;
	i = consoleget ();
	if (i < 0)
	  goto eof;
      }
    while (i != nl);
xb:
  breakline ();
  goto ok;
xp:
  printline ();
  if (num == 0)
    goto get;
xm:
  rightstar ();
  if (fp == fend)
    goto no;
  breakline ();
m1:
  refresh ();
  goto ok;
xk:
  pp = lbeg;
  fp = lend;
k1:
  if (fp == fend)
    goto no;
  goto m1;
xj:
  rightstar ();
  if (pp - lbeg > 80)
    goto no;
  goto k1;
xw:
  if (in == sin)
    goto no;
  makespace ();
  if (lbeg == top)
    goto no;
  lend = fp - pp + lbeg - 1;
  for (;;)
    {
      k = a[pp - 1];
      if (k == nl)
	if (pp != lbeg)
	  {
	    lbeg = pp;
	    ms = 0;
	    goto ok;
	  }
      fp = fp - 1;
      pp = pp - 1;
      a[fp] = k;
    }
  dosignal (0, 0, 0);
  exit (0);
}
