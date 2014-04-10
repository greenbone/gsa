About IT-Schwachstellenampel (ITS)
----------------------------------

ITS is a alternative face for GSA implementing a
"vulnerability taffic lights" scan user interface.
This essentially is a reduction to most simplified
steps to do a single scan of a single host with
the simple to understand result.

However, this is implemented in German language
only as it is being used to address specific German
user groups.

Nonetheless, it is a complete example on how faces
can be implemented and how to use the extended
wizard framework.


How to install:

Run cmake with the additional parameter "-DINSTALL_FACE_ITS=yes".
The classic interface will always be installed.


How to start:

Stop your gsad and restart it with the additional
parameter "--face=its".
Now you can login with your user account and have
a entirely new user interface.
You can switch back to classic by stopping gsad again
and start without the --face setting.
