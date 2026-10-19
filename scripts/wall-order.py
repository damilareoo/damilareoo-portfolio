import re, sys
from collections import OrderedDict

s = open('data/dossier.ts').read()
i = s.index('  shots: [')
j = s.index('] as {', i)
caps = re.findall(r'caption:\s*"([^"]+)"', s[i:j])

g = OrderedDict()
for c in caps:
    g[c.split('—')[0].strip().lower()] = g.get(c.split('—')[0].strip().lower(), 0) + 1
names = list(g)


def mulberry32(seed):
    a = [seed & 0xffffffff]

    def nxt():
        a[0] = (a[0] + 0x6d2b79f5) & 0xffffffff
        t = (a[0] ^ (a[0] >> 15)) * (1 | a[0])
        t = (t + (t ^ (t >> 7)) * (61 | t)) & 0xffffffff
        return ((t ^ (t >> 14)) & 0xffffffff) / 4294967296

    return nxt


def order(seed):
    o = names[:]
    r = mulberry32(seed)
    for k in range(len(o) - 1, 0, -1):
        j = int(r() * (k + 1))
        o[k], o[j] = o[j], o[k]
    return o


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--order":
        print("\n".join(order(int(sys.argv[2]))))
    else:
        print(" ".join(f"{n}" for n in names))