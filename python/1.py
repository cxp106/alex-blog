'''
Author: Alex
Date: 2021-11-25 10:30:32
LastEditTime: 2021-11-29 10:35:17
LastEditors: Alex
Description: 语言元素
'''

# 使用type()检查变量的类型

# a = 100
# b = 12.345
# c = 1 + 5j
# d = 'hello, world'
# e = True
# print(type(a))    # <class 'int'>
# print(type(b))    # <class 'float'>
# print(type(c))    # <class 'complex'>
# print(type(d))    # <class 'str'>
# print(type(e))    # <class 'bool'>

# 使用input()函数获取键盘输入(字符串)
# 使用int()函数将输入的字符串转换成整数
# 使用print()函数输出带占位符的字符串
# %d是整数的占位符，%f是小数的占位符，%%表示百分号（因为百分号代表了占位符，所以带占位符的字符串中要表示百分号必须写成%%）

# a = int(input('a = '))
# b = int(input('b = '))
# print('%d + %d = %d' % (a, b, a + b))
# print('%d - %d = %d' % (a, b, a - b))
# print('%d * %d = %d' % (a, b, a * b))
# print('%d / %d = %f' % (a, b, a / b))
# print('%d // %d = %d' % (a, b, a // b))
# print('%d %% %d = %d' % (a, b, a % b))
# print('%d ** %d = %d' % (a, b, a ** b))


# 赋值运算符和复合赋值运算符

# a = 10
# b = 3
# a += b        # 相当于：a = a + b
# a *= a + 2    # 相当于：a = a * (a + 2)
# print(a)      # 算一下这里会输出什么


# 比较运算符和逻辑运算符的使用

flag0 = 1 == 1
flag1 = 3 > 2
flag2 = 2 < 1
flag3 = flag1 and flag2
flag4 = flag1 or flag2
flag5 = not (1 != 2)
print('flag0 =', flag0)    # flag0 = True
print('flag1 =', flag1)    # flag1 = True
print('flag2 =', flag2)    # flag2 = False
print('flag3 =', flag3)    # flag3 = False
print('flag4 =', flag4)    # flag4 = True
print('flag5 =', flag5)    # flag5 = False

